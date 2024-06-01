<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let items: {
		label: string;
		value: string;
	}[];
	export let position: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

	const dispatch = createEventDispatcher<{
		selected: string;
	}>();

	let open = false;
	let trigger: HTMLDivElement;
	let dropdownStyle: string;

	function onUnfocus(event: Event) {
		if (!event.target) return;
		if (!trigger.contains(event.target)) {
			open = false;
		}
	}

	function dropdownPos(pos: string) {
		switch (pos) {
			case 'bottom':
				dropdownStyle = 'transform: translateX(-50%); left: 50%';
				break;
			case 'left':
				dropdownStyle = 'transform: translateY(-50%); top: 50%; right: 0';
		}
	}

	onMount(() => {
		dropdownPos(position);
	});

	$: {
		position;
		dropdownPos(position);
	}
</script>

<svelte:window on:click={onUnfocus} />

<div class="inline-block relative">
	<div
		bind:this={trigger}
		on:click={() => {
			open = !open;
		}}
	>
		<slot name="trigger"></slot>
	</div>
	<div
		style={dropdownStyle}
		class="{open
			? 'block'
			: 'hidden'} z-50 absolute flex flex-col min-w-48 my-1 w-fit bg-slate-300 text-slate-900 rounded-xl overflow-y-scroll"
	>
		{#each items as item}
			<button
				type="button"
				class="hover:bg-slate-400 py-2 px-6 w-full"
				on:click={() => {
					dispatch('selected', item.value);
				}}>{item.label}</button
			>
		{/each}
	</div>
</div>
