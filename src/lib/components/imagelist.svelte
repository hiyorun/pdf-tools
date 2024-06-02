<script lang="ts">
	import type { Image } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import Dropdown from './dropdown.svelte';
	import { dragHandle, dragHandleZone } from 'svelte-dnd-action';
	import { touchActions } from '$lib/actions';

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
		update: Image[];
		delete: number;
		'delete:all': null;
	}>();

	let list: HTMLDivElement;
	let itemsElement: HTMLButtonElement[] = [];
	let selectCount = 0;
	let moving: boolean = false;

	function sortFiles(e: CustomEvent) {
		dispatch('sort', e.detail);
	}

	function userSort(e: CustomEvent) {
		dispatch('update', e.detail.items);
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
		<Dropdown position="left" on:selected={sortFiles} items={filters}>
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
			class="bg-slate-300 text-slate-900 aspect-square rounded-full p-2"
			on:click={() => {
				Images.forEach((_, index) => {
					Images[index].selected = false;
				});
				dispatch('update', Images);
			}}
		>
			<span class="material-symbols-outlined"> cancel </span>
		</button>
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
	<div
		use:dragHandleZone={{ items: Images, flipDurationMs: 0 }}
		on:consider={userSort}
		on:finalize={userSort}
		bind:this={list}
		class="flex flex-col gap-2 items-center w-full"
	>
		{#each Images as image, index (image.id)}
			<button type="button" class="w-full h-28" draggable="true" bind:this={itemsElement[index]}>
				<div
					class="bg-slate-800 hover:bg-slate-700 flex grow justify-center items-center w-full h-28 rounded-2xl shadow pr-1 group"
				>
					{#if selectCount === 0}
						<button use:dragHandle class="w-11 h-full flex justify-center items-center">
							<div class="w-full h-full flex items-center justify-center">
								<span
									class="material-symbols-outlined text-slate-50 aspect-square rounded-full text-2xl"
									>drag_handle</span
								>
							</div>
						</button>
					{:else}
						<button
							class="w-5 aspect-square mx-3 flex justify-center items-center rounded-full {image.selected
								? 'bg-slate-300'
								: 'bg-slate-600'}"
						>
							<span
								class="material-symbols-outlined text-slate-900 aspect-square rounded-full text-sm"
								>{image.selected ? 'check' : ''}</span
							>
						</button>
					{/if}
					<button
						class="flex grow justify-center items-center w-full h-28"
						on:pointerdown={(e) => {
							if (e.pointerType === 'mouse') {
								console.log('on click');
								Images[index].selected = !Images[index].selected;
							}
						}}
						use:touchActions
						on:touch:long={() => {
							Images[index].selected = true;
						}}
						on:touch:move={() => {
							moving = true;
						}}
						on:touch:end={() => {
							if (!moving) {
								if (selectCount > 0) {
									Images[index].selected = !Images[index].selected;
								}
							}
							moving = false;
						}}
					>
						<div
							class="w-24 md:w-32 h-full flex justify-center items-center bg-slate-300 rounded-2xl overflow-hidden"
						>
							<img class="max-w-full max-h-full" src={image.el.src} alt={image.name} />
						</div>
						<div class="w-1/2 grow px-4 overflow-hidden text-left">{image.name}</div>
					</button>
				</div>
			</button>
		{/each}
	</div>
</div>
<div class="w-full text-center text-sm">
	Tip: You can click/tap and hold items to delete them individually.
</div>
