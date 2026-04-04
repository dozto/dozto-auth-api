import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cpus, freemem, hostname } from "node:os";

const MB = 1024 * 1024;
const GB = 1024 * 1024 * 1024;

export type HealthResponseBody = {
	readonly service: string;
	readonly status: "ok";
	readonly uptime: {
		readonly formatted: string;
		readonly secondsTotal: number;
	};
	readonly instanceName: string;
	readonly system: {
		/**
		 * 本进程 CPU 占用（0–100，一位小数）：相对**整机逻辑核数**归一化，表示自上次 `/health` 以来
		 * `process.cpuUsage()` 增量与墙钟时间的比例；首次调用区间为自进程/模块初始化起。
		 */
		readonly processCpuUsagePercent: number;
		/** 当前环境「还可供使用」的内存估算（MiB / GiB）；Linux 用 MemAvailable，macOS 用 vm_stat 启发式，其它用 `freemem` */
		readonly availableMemory: { readonly mb: number; readonly gb: number };
	};
};

const formatUptimeSeconds = (totalSeconds: number): string => {
	const s = Math.floor(Math.max(0, totalSeconds));
	const days = Math.floor(s / 86400);
	const hours = Math.floor((s % 86400) / 3600);
	const minutes = Math.floor((s % 3600) / 60);
	const seconds = s % 60;
	return `${days}D ${hours}H ${minutes}M ${seconds}S`;
};

const bytesToMbGb = (bytes: number): { mb: number; gb: number } => ({
	mb: Math.round((bytes / MB) * 10) / 10,
	gb: Math.round((bytes / GB) * 100) / 100,
});

/** Linux：`MemAvailable` 最接近「应用还可申请」的内存。 */
const getAvailableMemoryBytesLinux = (): number | undefined => {
	try {
		const text = readFileSync("/proc/meminfo", "utf8");
		const m = text.match(/^MemAvailable:\s+(\d+)\s+kB/m);
		if (m?.[1]) {
			return parseInt(m[1], 10) * 1024;
		}
	} catch {
		/* ignore */
	}
	return undefined;
};

const DARWIN_CACHE_TTL_MS = 5_000;
let darwinCachedBytes: number | undefined;
let darwinCacheTimestamp = 0;

/**
 * macOS：`freemem()` 往往偏小；用 vm_stat 中多类页之和 × page size 作可用量近似。
 * 缓存 5 秒避免高频调用 execSync 的性能开销。
 */
const getAvailableMemoryBytesDarwin = (): number => {
	const now = Date.now();
	if (
		darwinCachedBytes !== undefined &&
		now - darwinCacheTimestamp < DARWIN_CACHE_TTL_MS
	) {
		return darwinCachedBytes;
	}
	try {
		const out = execSync("vm_stat", {
			encoding: "utf8",
			maxBuffer: 256 * 1024,
			timeout: 2000,
		});
		const ps = out.match(/page size of (\d+)/i);
		const pageSize = ps?.[1] ? parseInt(ps[1], 10) : 4096;
		const n = (label: string) => {
			const line = out.match(new RegExp(`^${label}:\\s+(\\d+)\\.?$`, "m"));
			return line?.[1] ? parseInt(line[1], 10) : 0;
		};
		const pages =
			n("Pages free") +
			n("Pages inactive") +
			n("Pages speculative") +
			n("Pages purgeable");
		darwinCachedBytes = pages * pageSize;
	} catch {
		darwinCachedBytes = freemem();
	}
	darwinCacheTimestamp = now;
	return darwinCachedBytes;
};

const getAvailableMemoryBytes = (): number => {
	if (process.platform === "linux") {
		const fromProc = getAvailableMemoryBytesLinux();
		if (fromProc !== undefined) {
			return fromProc;
		}
	}
	if (process.platform === "darwin") {
		return getAvailableMemoryBytesDarwin();
	}
	return freemem();
};

let lastProcessCpu = process.cpuUsage();
let lastProcessCpuWallMs = performance.now();

/** 同步：相对逻辑核数归一化的本进程 CPU 占比（两次 `/health` 之间的区间；首次为自初始化起）。 */
const getProcessCpuUsagePercent = (): number => {
	const now = performance.now();
	const wallMicros = Math.max(1, (now - lastProcessCpuWallMs) * 1000);
	const cpuDelta = process.cpuUsage(lastProcessCpu);
	lastProcessCpu = process.cpuUsage();
	lastProcessCpuWallMs = now;

	const totalCpuMicros = cpuDelta.user + cpuDelta.system;
	const logicalCores = cpus().length || 1;
	const raw = (totalCpuMicros / wallMicros) * (100 / logicalCores);
	return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
};

/**
 * 组装 `GET /health` 响应：`service` 由调用方传入（如 `hono` 使用 `getEnv().SERVICE_NAME`）。
 */
export const buildHealthResponse = (
	serviceName: string,
): HealthResponseBody => {
	const secondsTotal = Math.floor(process.uptime());
	const availableBytes = getAvailableMemoryBytes();
	const processCpuUsagePercent = getProcessCpuUsagePercent();
	const { mb, gb } = bytesToMbGb(availableBytes);

	return {
		service: serviceName,
		status: "ok",
		uptime: {
			formatted: formatUptimeSeconds(secondsTotal),
			secondsTotal,
		},
		instanceName: hostname(),
		system: {
			processCpuUsagePercent,
			availableMemory: { mb, gb },
		},
	};
};
