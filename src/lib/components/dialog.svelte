<svelte:options accessors />

<script lang="ts">
	type Dialog = {
		title: string;
		content: string;
		cancelCallback: () => void;
		confirmCallback: () => void;
	};

	export let open = false;
	export let dialogProps: Dialog = {
		title: 'Dialog Title',
		content: 'Dialog content',
		cancelCallback: () => {},
		confirmCallback: () => {}
	};

	export function setDialog(values: Dialog) {
		dialogProps = values;
	}

	export function openDialog() {
		open = true;
	}

	export function closeDialog() {
		open = false;
	}
</script>

<div
	class="{open
		? ''
		: 'hidden'} z-50 fixed top-0 left-0 w-screen h-screen flex justify-center items-center p-2 md:p-0 bg-black/50"
>
	<div class="bg-slate-700 text-slate-300 rounded-2xl w-full md:max-w-2xl p-6 flex flex-col gap-2">
		<slot name="title">
			<div class="font-semibold text-2xl overflow-hidden">
				{dialogProps.title}
			</div>
		</slot>
		<slot name="content">
			<div class="">
				{dialogProps.content}
			</div>
		</slot>
		<div class="flex justify-end gap-2">
			<div on:click={dialogProps.confirmCallback}>
				<slot name="confirmBtn">
					<button class="p-2 rounded-full min-w-20 hover:bg-slate-400 bg-slate-300 text-slate-900">
						OK
					</button>
				</slot>
			</div>
			<div on:click={dialogProps.cancelCallback}>
				<slot name="cancelBtn">
					<button class="p-2 rounded-full min-w-20 hover:bg-slate-600 bg-slate-700 text-slate-900">
						Cancel
					</button>
				</slot>
			</div>
		</div>
	</div>
</div>
