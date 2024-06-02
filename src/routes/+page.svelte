<script lang="ts">
	import Dialog from '$lib/components/dialog.svelte';
	import Imagelist from '$lib/components/imagelist.svelte';
	import Progress from '$lib/components/progress.svelte';
	import genPDF from '$lib/generator';
	import type { Image } from '$lib/types';
	import { v4 as uuidv4 } from 'uuid';
	import type { SvelteComponent } from 'svelte';

	let Images: Image[] = [];
	let isDragging = false;
	let sortBy = 'name';
	let descending = false;
	let deleteDialog: SvelteComponent;
	let busy = false;
	let processes: genPDF[] = [];

	function handleFileChange(event: Event) {
		busy = true;
		const files = (event.target as HTMLInputElement)?.files;
		if (!files) return;
		processFiles(files);
	}

	async function processFiles(files: FileList) {
		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.readAsArrayBuffer(files[i]);

			const e = await new Promise((resolve) => {
				reader.onload = resolve;
			});

			if (e.target?.error) {
				// Handle errors if needed
				continue;
			}

			const image = await createImageElement(new Uint8Array(e.target.result as ArrayBuffer));
			Images = [
				...Images,
				{
					id: uuidv4(),
					el: image,
					name: files[i].name,
					date: files[i].lastModified,
					selected: false
				}
			];
		}
		busy = false;
	}

	async function generatePDF() {
		const newProcess = new genPDF(Images);
		processes = [...processes, newProcess];
		newProcess.generatePDF();
	}

	function onSort(e: CustomEvent) {
		sortBy = e.detail;
		sortFile(sortBy, descending);
	}

	function reverseSort() {
		descending = !descending;
		sortFile(sortBy, descending);
	}

	function sortFile(by: string, reverse: boolean) {
		console.log('sorting by', by);
		if (Images.length === 0) return;
		const preProcess = Images;
		if (by === 'name') {
			preProcess.sort((a, b) => {
				if (a.name < b.name) return !reverse ? -1 : 1;
				if (a.name > b.name) return !reverse ? 1 : -1;
				return 0;
			});
		} else if (by === 'date') {
			preProcess.sort((a, b) => {
				if (a.date < b.date) return !reverse ? -1 : 1;
				if (a.date > b.date) return !reverse ? 1 : -1;
				return 0;
			});
		}
		Images = preProcess;
	}

	function createImageElement(data: Uint8Array): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = URL.createObjectURL(new Blob([data]));
		});
	}

	function handleDragOver(event: Event) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event: Event) {
		event.preventDefault();
		const files = event.dataTransfer.files;
		processFiles(files);
		isDragging = false;
	}

	function onUpdate(event: CustomEvent) {
		if (!event.detail) return;
		Images = event.detail;
	}

	function deleteSelected(e: CustomEvent) {
		if (Images.length === 0) return;
		console.log('delete one');
		deleteDialog.setDialog({
			title: `Delete Selected`,
			content: `Do you want to delete these ${e.detail} files?`,
			cancelCallback: () => deleteDialog.closeDialog(),
			confirmCallback: () => {
				const preProcess = Images.filter((val) => !val.selected);
				Images = preProcess;
				deleteDialog.closeDialog();
			}
		});
		deleteDialog.openDialog();
	}

	function deleteAll() {
		if (Images.length === 0) return;
		deleteDialog.setDialog({
			title: 'Delete All',
			content: 'Do you really want to delete all of the images?',
			cancelCallback: () => deleteDialog.closeDialog(),
			confirmCallback: () => {
				Images = [];
				deleteDialog.closeDialog();
			}
		});
		deleteDialog.openDialog();
	}
</script>

<a href="https://github.com/hiyorun/pdf-tools.hiyo.run" type="button" class="fixed left-1 top-1 w-10 h-10 aspect-square rounded-full bg-slate-600 p-2">
	<svg xmlns="http://www.w3.org/2000/svg" class="fill-slate-300" viewBox="0 0 92 92">
		<defs>
			<clipPath id="a">
				<path d="M0 .113h91.887V92H0Zm0 0" />
			</clipPath>
		</defs>
		<g clip-path="url(#a)">
			<path
				d="M90.156 41.965 50.036 1.848a5.918 5.918 0 0 0-8.372 0l-8.328 8.332 10.566 10.566a7.03 7.03 0 0 1 7.23 1.684 7.034 7.034 0 0 1 1.669 7.277l10.187 10.184a7.028 7.028 0 0 1 7.278 1.672 7.04 7.04 0 0 1 0 9.957 7.05 7.05 0 0 1-9.965 0 7.044 7.044 0 0 1-1.528-7.66l-9.5-9.497V59.36a7.04 7.04 0 0 1 1.86 11.29 7.04 7.04 0 0 1-9.957 0 7.04 7.04 0 0 1 0-9.958 7.06 7.06 0 0 1 2.304-1.539V33.926a7.049 7.049 0 0 1-3.82-9.234L29.242 14.272 1.73 41.777a5.925 5.925 0 0 0 0 8.371L41.852 90.27a5.925 5.925 0 0 0 8.37 0l39.934-39.934a5.925 5.925 0 0 0 0-8.371"
			/></g
		></svg
	>
</a>

<Dialog bind:this={deleteDialog} />

<Progress {processes} class="absolute bottom-2 left-2" />

<div
	class="w-screen h-screen min-w-96 bg-slate-900 text-slate-300 flex justify-center items-center overflow-hidden"
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	role="none"
>
	<div class="flex flex-col gap-2 justify-center items-center w-full max-w-2xl max-h-full p-2">
		<input
			id="upload-file"
			class="hidden"
			type="file"
			on:change={handleFileChange}
			accept="image/png, image/jpeg"
			multiple
		/>
		{#if Images.length !== 0}
			<Imagelist
				{Images}
				on:delete={deleteSelected}
				on:delete:all={() => {
					deleteAll();
				}}
				on:sort={onSort}
				on:asc={() => {
					reverseSort();
				}}
				on:update={onUpdate}
			/>
		{:else}
			<label for="upload-file">
				<div
					class="text-center flex flex-col gap-2 items-center justify-center border rounded-2xl p-10 cursor-pointer"
				>
					<span class="material-symbols-outlined text-7xl"> image </span>
					Drop your photos,<br />or click here to browse your files.
					<br />
					<span class="text-sm text-slate-500 text-center">
						Your photos won't go anywhere, everything is processed locally on your PC.
						<br />
						See source by clicking the button on top-left corner.
					</span>
				</div>
			</label>
		{/if}
		<div class="absolute bottom-3 right-3 flex flex-col items-center gap-4">
			{#if Images.length !== 0}
				<button
					disabled={busy}
					class="rounded-xl p-6 w-6 h-6 flex justify-center items-center bg-slate-300 text-slate-900 hover:bg-slate-400 cursor-pointer disabled:bg-slate-500"
					on:click={generatePDF}
				>
					<span class=" material-symbols-outlined"> file_save </span>
				</button>
			{/if}
			<label
				for="upload-file"
				class="rounded-2xl p-10 w-10 h-10 flex justify-center items-center bg-indigo-500 text-indigo-50 hover:bg-indigo-600 cursor-pointer"
			>
				<span class="text-4xl material-symbols-outlined"> add </span>
			</label>
		</div>
	</div>
</div>
