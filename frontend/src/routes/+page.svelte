<script>
	import { goto } from "$app/navigation";
	import { auth } from "$lib/auth.js"; // Import the auth store
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	// --- Configuration ---
	const baseUrl = "http://localhost:3001"; // Make sure this matches your server

	// --- Component State ---
	let email = "";
	let password = "";
	let error = null;
	let isLoading = false;

	async function handleLogin() {
		isLoading = true;
		error = null;

		try {
			const response = await fetch(`${baseUrl}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				// Use the error message from the server, or a default one
				throw new Error(data.message || "Invalid credentials. Please try again.");
			}

			// On successful login, save the token and user info using the auth store
			auth.login(data.token, data.user);
			console.log("Login successful! User:", data.user);

			// Redirect based on user role
			switch (data.user.role) {
				case "admin":
					await goto("/admin/dashboard");
					break;
				case "student":
					await goto("/student/dashboard");
					break;
				case "teacher":
					await goto("/teacher/dashboard");
					break;
				default:
					// Fallback for an unknown role
					console.error("Unknown user role:", data.user.role);
					error = "Your account has an unrecognized role.";
					auth.logout(); // Log out if role is invalid
					break;
			}
		} catch (e) {
			console.error("Login failed:", e);
			error = e.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	<div class="flex items-center justify-center py-12">
		<div class="mx-auto grid w-[350px] gap-6">
			<div class="grid gap-2 text-center">
				<h1 class="text-3xl font-bold">Login</h1>
				<p class="text-muted-foreground text-balance">
					Enter your email below to login to your account
				</p>
			</div>
			<!-- Use a form element for better accessibility and semantics -->
			<form on:submit|preventDefault={handleLogin} class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<!-- Bind input value to the email variable -->
					<Input
						bind:value={email}
						id="email"
						type="email"
						placeholder="m@example.com"
						required
						disabled={isLoading}
					/>
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
						<a href="/forgot-password" class="ml-auto inline-block text-sm underline">
							Forgot your password?
						</a>
					</div>
					<!-- Bind input value to the password variable -->
					<Input
						bind:value={password}
						id="password"
						type="password"
						required
						disabled={isLoading}
					/>
				</div>

				<!-- Display error message if one exists -->
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}

				<!-- Disable button while loading and show a message -->
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						Logging in...
					{:else}
						Login
					{/if}
				</Button>
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account?
				<a href="/register" class="underline"> Sign up </a>
			</div>
		</div>
	</div>
	<div class="bg-muted hidden lg:block">
		<img
			src="/images/placeholder.svg"
			alt="placeholder"
			width="1920"
			height="1080"
			class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
