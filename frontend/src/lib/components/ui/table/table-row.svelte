<script>
	import { cn } from "$lib/utils.js";
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn(
		"hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
