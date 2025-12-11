<script lang="js">
	let a = $state(0)
	let b = $state(0)
	let total = $state(0)

	async function add() {
		const response = await fetch('/api/add', {
			method: 'POST',
			body: JSON.stringify({ a, b }),
			headers: {
				'content-type': 'application/json'
			}
		})

		total = await response.json()
	}
</script>

<section>
	<div>
		<div>
			<input type="number" bind:value={a} /> +
			<input type="number" bind:value={b} /> =
			{total}
		</div>
		<div class="form-control">
			<button onclick={add}>Calculate</button>
		</div>
	</div>
</section>

<style>
	section {
		align-items: center;
		display: flex;
		height: 100dvh;
		justify-content: center;
		scale: 3;
		width: 100%;
	}

	.form-control {
		margin-block-start: 1.5rem;
		text-align: center;
	}
</style>