<script lang="ts">
	import type { Image } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import Dropdown from './dropdown.svelte';

	export let Images: Image[];

	const filters = [
		{
			label: 'By Name',
			value: 'name'
		},
		{
			label: 'By Date',
			value: 'date'
		}
	];

	const dispatch = createEventDispatcher<{
		sort: string;
		asc: null;
		delete: number;
		'delete:all': null;
	}>();

	let list: HTMLDivElement;
	let timer: number | null;
	let touchduration = 800;
	let itemsElement: HTMLButtonElement[] = [];
	let selectCount = 0;

	function sortFiles(e: CustomEvent) {
		dispatch('sort', e.detail);
	}

	function imageMenu(e: CustomEvent, index: number) {
		if (e.detail === 'up') {
			if (index === 0) return;
			const storeBefore = Images[index - 1];
			Images[index - 1] = Images[index];
			Images[index] = storeBefore;
		} else if (e.detail === 'down') {
			if (index === Images.length - 1) return;
			const storeBefore = Images[index + 1];
			Images[index + 1] = Images[index];
			Images[index] = storeBefore;
		}
	}

	function touchstart(e: Event, index: number) {
		e.preventDefault();
		if (!timer) {
			timer = setTimeout(function () {
				onLongTouch(index);
			}, touchduration);
		}
	}

	function touchend(index: number) {
		if (selectCount !== 0 && timer) {
			Images[index].selected = !Images[index].selected;
		}
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function onLongTouch(index: number) {
		timer = null;
		console.log('long', index);
		Images[index].selected = true;
	}

	function reAttachListener() {
		itemsElement.forEach((el, index) => {
			if (!el) return;
			el.removeEventListener(
				'touchstart',
				function (evt) {
					touchstart(evt, index);
				},
				false
			);
			el.removeEventListener(
				'touchend',
				function () {
					touchend(index);
				},
				false
			);
		});
		itemsElement.forEach((el, index) => {
			if (!el) return;
			el.addEventListener(
				'touchstart',
				function (evt) {
					touchstart(evt, index);
				},
				false
			);
			el.addEventListener(
				'touchend',
				function () {
					touchend(index);
				},
				false
			);
		});
	}

	$: {
		itemsElement;
		reAttachListener();
	}

	$: {
		Images;
		selectCount = 0;
		Images.forEach((el) => {
			if (el.selected) selectCount += 1;
		});
	}
</script>

<div class="flex w-full justify-end items-center gap-2 pr-2">
	{#if selectCount === 0}
		<button
			class="bg-red-500 text-red-950 rounded-full py-2 px-4 flex items-center gap-2"
			on:click={() => {
				dispatch('delete:all');
			}}
		>
			<span>Delete All</span>
			<span class="material-symbols-outlined"> delete </span>
		</button>
		<Dropdown position="bottom" on:selected={sortFiles} items={filters}>
			<button slot="trigger" class="bg-slate-300 text-slate-900 aspect-square rounded-full p-2">
				<span class="material-symbols-outlined"> sort </span>
			</button>
		</Dropdown>
		<button
			class="bg-slate-300 text-slate-900 aspect-square rounded-full p-2"
			on:click={() => {
				dispatch('asc');
			}}
		>
			<span class="material-symbols-outlined"> swap_vert </span>
		</button>
	{:else}
		<span>Selected {selectCount} items</span>
		<button
			class="bg-red-500 text-red-950 aspect-square rounded-full p-2"
			on:click={() => {
				dispatch('delete', selectCount);
			}}
		>
			<span class="material-symbols-outlined"> delete </span>
		</button>
	{/if}
</div>
<div class="overflow-y-scroll w-full relative p-2">
	<div bind:this={list} class="flex flex-col gap-2 items-center w-full p-">
		{#each Images as image, index}
			<button
				bind:this={itemsElement[index]}
				on:click={() => {
					Images[index].selected = !Images[index].selected;
				}}
				class="bg-slate-800 hover:bg-slate-700 flex grow justify-center items-center w-full h-28 rounded-2xl shadow pr-1 group"
			>
				<div
					class="relative w-24 md:w-32 h-full flex justify-center items-center bg-slate-300 rounded-2xl overflow-hidden"
				>
					<div
						class="{image.selected
							? 'flex'
							: 'hidden'} absolute top-0 left-0 w-full h-full bg-slate-900/30 justify-center items-center"
					>
						<span class="material-symbols-outlined bg-slate-300 text-slate-900 rounded-full p-1"
							>check</span
						>
					</div>
					<img class="max-w-full max-h-full" src={image.el.src} alt={image.name} />
				</div>
				<div class="w-1/2 grow px-4 overflow-hidden">{image.name}</div>

				<button>
					<span
						class="material-symbols-outlined text-slate-50 aspect-square rounded-full p-2 text-2xl"
						>drag_handle</span
					>
				</button>
			</button>
		{/each}
	</div>
</div>
