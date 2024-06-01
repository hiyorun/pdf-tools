<script lang="ts">
	import { jsPDF } from 'jspdf';

	type Image = {
		el: HTMLImageElement;
		name: string;
	};
	let Images: Image[] = [];
	
	let list: HTMLDivElement;

	function handleFileChange(event: Event) {
		const files = (event.target as HTMLInputElement)?.files;
		if (!files) return;

		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.readAsArrayBuffer(files[i]);
			reader.onload = async (e) => {
				const image = await createImageElement(new Uint8Array(e.target?.result as ArrayBuffer));
				Images = [
					...Images,
					{
						el: image,
						name: files[i].name
					}
				];
			};
		}
	}

	async function generatePDF() {
		if (!Images.length) return;

		const doc = new jsPDF({ format: 'a4' });
		const width = doc.internal.pageSize.getWidth();
		const height = doc.internal.pageSize.getHeight();

		Images.forEach((image, index) => {
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
			index++;
			doc.addPage();
		});

		doc.save('image.pdf');
	}

	function createImageElement(data: Uint8Array): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = URL.createObjectURL(new Blob([data]));
		});
	}
	
	function deleteImage(index: number){
	  if(!Images.length) return;
	  const preProcess = Images
	  preProcess.splice(index, 1)
	  Images = preProcess
	}
	
	$: {
		Images;
		console.log(Images);
	}
</script>

<div
	class="w-screen h-screen bg-slate-900 text-slate-300 flex flex-col gap-2 justify-center items-center"
>
	<input
		class="border border-slate-300 rounded-full file:bg-slate-300 file:text-slate-900 file:border-0 file:rounded-full file:p-2 p-1"
		type="file"
		on:change={handleFileChange}
		accept="image/png, image/jpeg"
		multiple
	/>
	<div bind:this={list} class="flex flex-col gap-2 items-center w-full p-2">
		{#if Images.length !== 0}
			{#each Images as image, index}
				<div
					class="border border-slate-300 flex grow justify-center items-center max-w-2xl w-full h-28 overflow-hidden rounded-lg shadow"
				>
	        <div class="w-28 h-28 flex justify-center items-center border overflow-hidden">
					  <img class="max-w-full max-h-full" src={image.el.src} alt={image.name} />
	        </div>
					<span class="grow px-4">{image.name}</span>
					  <button on:click="{()=>{deleteImage(index)}}">
					    <span class="material-symbols-outlined p-2 rounded-full">cancel</span>
					  </button>
				</div>
			{/each}
		{/if}
	</div>
	<button class="rounded-full bg-slate-300 text-slate-900 border-0 p-2" on:click={generatePDF}
		>Generate PDF</button
	>
</div>
