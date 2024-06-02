<script lang="ts">
	import { progressStore } from '$lib/store/processInfo';
	import type { ProcessInfo } from '$lib/types';

	let processes: Record<string, ProcessInfo> = {};

	progressStore.subscribe((val) => {
		const asArray = Object.entries(val);
		const filtered = asArray.filter(([_, value]) => value.state !== 0);
		const noSuccess = Object.fromEntries(filtered);
		processes = noSuccess;
	});
</script>

<div class="{$$props.class} flex flex-col gap-2 z-50">
	{#each Object.entries(processes) as [id, info] (id)}
		<div class="p-4 rounded-2xl bg-slate-300 text-slate-900">
			<div class="text-sm text-slate-700">
				Processing {info.filename}
			</div>
			<div class="w-full h-1 mt-2 rounded-full bg-slate-400">
				<div style="width: {Math.floor(info.progress * 100)}%" class="transition-all h-full bg-slate-900 rounded-full">
				</div>
			</div>
		</div>
	{/each}
</div>
