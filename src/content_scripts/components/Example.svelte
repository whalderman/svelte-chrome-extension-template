<script lang="ts">
	import { fly } from "svelte/transition";
	import { get_message } from "../../shared/get_message";

	const best_of_luck = "Best of luck to you in creating your extension.";
	const duration = 2;
	const dur_step = duration / best_of_luck.length;
</script>

<p>{get_message("extension_name")}</p>
<p>{get_message("extension_description")}</p>
<p style="white-space: pre" style:--duration="{duration}s">
	{#await new Promise((res) => setTimeout(res, 1000)) then _}
		{#each best_of_luck as char, ii}
			{@const delay = dur_step * ii}
			<span
				style:--delay="{delay}s"
				in:fly|global={{
					delay: delay * 1000,
					duration: duration * 1000,
					opacity: 0,
					y: -10,
				}}>{char}</span
			>
		{/each}
	{/await}
</p>

<style>
	@keyframes shift {
		0% {
			translate: 0px 0px;
		}
		100% {
			translate: 0px 6px;
		}
	}

	span {
		display: inline-block;
		animation-name: shift;
		animation-duration: var(--duration);
		animation-delay: var(--delay);
		animation-iteration-count: infinite;
		animation-fill-mode: forwards;
		animation-timing-function: ease-in-out;
		animation-direction: alternate;
	}
</style>
