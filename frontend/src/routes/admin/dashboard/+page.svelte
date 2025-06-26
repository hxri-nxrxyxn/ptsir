<script lang="ts">
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import { Button } from "$lib/components/ui/button";

    const adminName = "Hari";
    const pendingUsersCount = 12;
    const coursesToAllotCount = 5;
    const totalActiveUsers = 256;


    // ADDED: Define the navigation data here.
    // You can now customize this data for any page.
    const sidebarNavData = {
        navMain: [
            {
                title: "Panels",
                url: "#",
                items: [
                    {
                        title: "Dashboard",
                        url: "/admin/dashboard",
                        isActive: true, // You can control active state from here
                    },
                    {
                        title: "Approve Users",
                        url: "/admin/users",
                    },
                    {
                        title: "Alotted Courses",
                        url: "/admin/courses",
                    },
                ],
            },
        ],
    };
    </script>

<Sidebar.Provider>
    <!-- MODIFIED: Pass the 'sidebarNavData' to the 'navData' prop of AppSidebar -->
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
                            <Breadcrumb.Page>Dashboard</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </header>
        <div class="mx-8 my-4">
            <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
                Hello {adminName}!
            </h1>


            <div class="flex my-4 gap-4">
                <div class="w-1/3">
                    <Card.Root>
                        <Card.Header class="pb-2">
                            <Card.Description>Pending Approvals</Card.Description>
                            <Card.Title class="text-3xl">{pendingUsersCount}</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="text-muted-foreground text-xs">New user accounts waiting for review.</div>
                        </Card.Content>
                        <Card.Footer>
                            <Button href="/admin/users" class="w-full" variant="outline">Approve Users</Button>
                        </Card.Footer>
                    </Card.Root>
                </div>
                <div class="w-1/3">
                    <Card.Root>
                        <Card.Header class="pb-2">
                            <Card.Description>Course Alottments</Card.Description>
                            <Card.Title class="text-3xl">{coursesToAllotCount}</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="text-muted-foreground text-xs">Assign courses to newly approved users.</div>
                        </Card.Content>
                        <Card.Footer>
                            <Button href="/admin/courses" class="w-full" variant="outline">Alott Courses</Button>
                        </Card.Footer>
                    </Card.Root>
                </div>
                <div class="w-1/3">
                    <Card.Root>
                        <Card.Header class="pb-2">
                            <Card.Description>Total Active Users</Card.Description>
                            <Card.Title class="text-3xl">{totalActiveUsers}</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="text-muted-foreground text-xs">Overall user engagement on the platform.</div>
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
        </div>

    </Sidebar.Inset>
</Sidebar.Provider>
