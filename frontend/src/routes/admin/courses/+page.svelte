<script lang="ts">
    import { onMount } from "svelte";
    import { auth } from "$lib/auth"; // Import our new auth store
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import Trash2 from "lucide-svelte/icons/trash-2";

    // --- Configuration ---
    const baseUrl = "http://localhost:3001"; // Change this if your server runs elsewhere

    // --- Component State ---
    let courses: any[] = [];
    let users: any[] = []; // To map creator ID to name
    let isLoading = true;
    let error: string | null = null;
    let token: string | null = null;

    // Form state for creating a new course
    let newCourseTitle = "";
    let newCourseDescription = "";

    const sidebarNavData = {
        navMain: [
            {
                title: "Panels",
                url: "#",
                items: [
                    { title: "Dashboard", url: "/admin/dashboard" },
                    { title: "Approve Users", url: "/admin/users" },
                    { title: "Courses", url: "/admin/courses", isActive: true },
                ],
            },
        ],
    };

    // Subscribe to the auth store to get the token
    auth.subscribe((value) => {
        token = value.token;
    });

    // --- Data Fetching and API Interaction ---
    onMount(async () => {
        if (!token) {
            error = "Authentication error: No token found. Please log in.";
            isLoading = false;
            // In a real app, you would redirect to the login page here.
            // import { goto } from '$app/navigation';
            // goto('/login');
            return;
        }
        await fetchData();
    });

    async function fetchData() {
        isLoading = true;
        try {
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch both courses and users to map creator names
            const [coursesRes, usersRes] = await Promise.all([
                fetch(`${baseUrl}/api/admin/courses`, { headers }),      // GET /api/courses
                fetch(`${baseUrl}/api/admin/users`, { headers }), // GET /api/admin/users
            ]);

            if (!coursesRes.ok || !usersRes.ok) {
                throw new Error("Failed to fetch data from the server.");
            }

            courses = await coursesRes.json();
            users = await usersRes.json();
            console.log("Fetched courses:", courses);
            console.log("Fetched users:", users);

        } catch (e: any) {
            error = e.message;
            console.error("Fetch error:", e);
        } finally {
            isLoading = false;
        }
    }

    // Helper function to find the creator's name from their ID
    function getCreatorName(userId: number): string {
        const user = users.find(u => u.id === userId);
        return user ? user.name : "Unknown";
    }

    async function handleCreateCourse() {
        if (!newCourseTitle || !newCourseDescription || !token) return;

        console.log(`CREATING course: "${newCourseTitle}"`);
        try {
            const response = await fetch(`${baseUrl}/api/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: newCourseTitle,
                    description: newCourseDescription,
                }),
            });

            if (!response.ok) throw new Error("Failed to create course.");

            const createdCourse = await response.json();
            console.log("SUCCESS: Course created.", createdCourse);

            // Reset form and refresh data
            newCourseTitle = "";
            newCourseDescription = "";
            await fetchData(); // Refresh the list

        } catch (e: any) {
            console.error("Create course error:", e);
            alert(`Error: ${e.message}`);
        }
    }

    async function handleDeleteCourse(courseId: number) {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.") || !token) {
            return;
        }

        console.log(`DELETING course with ID: ${courseId}`);
        try {
            const response = await fetch(`${baseUrl}/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete course.");

            const result = await response.json();
            console.log(`SUCCESS: ${result.message}`);

            // Update UI by removing the deleted course
            courses = courses.filter(c => c.id !== courseId);

        } catch (e: any) {
            console.error(`Delete course error for ID ${courseId}:`, e);
            alert(`Error: ${e.message}`);
        }
    }
</script>

<Sidebar.Provider>
    <AppSidebar navData={sidebarNavData} />

    <Sidebar.Inset>
        <header class="flex h-16 shrink-0 items-center gap-2">
            <div class="flex items-center gap-2 px-3">
                <Sidebar.Trigger />
                <Separator orientation="vertical" class="mr-2 h-4" />
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item class="hidden md:block">
                            <Breadcrumb.Link href="#">Admin</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator class="hidden md:block" />
                        <Breadcrumb.Item>
                            <Breadcrumb.Page>Courses</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </header>
        <div class="p-4 md:p-8">
            <h1 class="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-6">
                Manage Courses
            </h1>

            <!-- Create Course Form -->
            <Card.Root class="mb-8">
                <Card.Header>
                    <Card.Title>Create New Course</Card.Title>
                    <Card.Description>Add a new course to the platform.</Card.Description>
                </Card.Header>
                <Card.Content class="grid gap-4">
                    <Input bind:value={newCourseTitle} placeholder="Course Title (e.g., Introduction to AI)" />
                    <Textarea bind:value={newCourseDescription} placeholder="Course Description..." />
                </Card.Content>
                <Card.Footer>
                    <Button onclick={handleCreateCourse}>Create Course</Button>
                </Card.Footer>
            </Card.Root>

            <!-- Display Area -->
            {#if isLoading}
                <p>Loading courses...</p>
            {:else if error}
                <p class="text-destructive">{error}</p>
            {:else}
                <h2 class="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight mb-4">
                    Existing Courses
                </h2>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-[30%]">Title</Table.Head>
                            <Table.Head>Description</Table.Head>
                            <Table.Head class="w-[15%]">Created By</Table.Head>
                            <Table.Head class="w-[10%] text-right">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each courses as course (course.id)}
                            <Table.Row>
                                <Table.Cell class="font-medium">{course.title}</Table.Cell>
                                <Table.Cell>{course.description}</Table.Cell>
                                <Table.Cell>{getCreatorName(course.created_by_user_id)}</Table.Cell>
                                <Table.Cell class="text-right">
                                    <Button onclick={() => handleDeleteCourse(course.id)} variant="ghost" size="icon">
                                        <Trash2 class="size-4" />
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
                 {#if courses.length === 0}
                    <p class="text-center text-muted-foreground mt-4">No courses found.</p>
                 {/if}
            {/if}
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
