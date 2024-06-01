<script lang="ts">
	import Dialog from '$lib/components/dialog.svelte';
	import Imagelist from '$lib/components/imagelist.svelte';
	import type { Image } from '$lib/types';
	import { jsPDF } from 'jspdf';
	import type { SvelteComponent } from 'svelte';

	let Images: Image[] = [];
	let isDragging = false;
	let sortBy = 'name';
	let descending = false;
	let deleteDialog: SvelteComponent;
	let busy = false;

	function handleFileChange(event: Event) {
		busy = true
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
					el: image,
					name: files[i].name,
					date: files[i].lastModified,
					selected: false
				}
			];
		}
		busy = false
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

	async function generatePDF() {
		if (Images.length === 0) return;

		const saveImage = [...Images];
		if (saveImage.length === 0) return;

		const doc = new jsPDF({ format: 'a4' });
		const width = doc.internal.pageSize.getWidth();
		const height = doc.internal.pageSize.getHeight();

		saveImage.forEach((image, index) => {
			const imgWidth = image.el.naturalWidth;
			const imgHeight = image.el.naturalHeight;

			// Aspect ratio calculation to fit image without stretching
			const scale = Math.min(width / imgWidth, height / imgHeight);
			const scaledWidth = imgWidth * scale;
			const scaledHeight = imgHeight * scale;

			// Place image in the center of the A4 page
			const x = (width - scaledWidth) / 2;
			const y = (height - scaledHeight) / 2;

			console.log(x, y, index);

			doc.addImage(image.el, 'JPEG', x, y, scaledWidth, scaledHeight);
			if (index < saveImage.length - 1) {
				doc.addPage();
			}
		});

		const filename = new Date().toISOString();

		doc.save(filename);
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

	function onDragNDrop(event: CustomEvent) {
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

<Dialog bind:this={deleteDialog} />

<div
	class="w-screen h-screen bg-slate-900 text-slate-300 flex justify-center items-center overflow-hidden"
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
				on:drag={onDragNDrop}
			/>
		{:else}
			<label for="upload-file">
				<div
					class="text-center flex flex-col gap-2 items-center justify-center border rounded-2xl p-10 cursor-pointer"
				>
					<span class="material-symbols-outlined text-7xl"> image </span>
					Drop your photos here, or browse.
					<br />
					<span class="text-sm text-slate-500 text-center">
						Your photos won't go anywhere, everything is processed locally on your PC.
						<br />
						See source on top right corner on GitHub.
					</span>
				</div>
			</label>
		{/if}
		<div class="absolute bottom-3 right-3 flex flex-col items-center gap-4">
			{#if Images.length !== 0}
				<button disabled={busy}
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
