import { createFileRoute, redirect } from "@tanstack/react-router";

// Checkout is now embedded on the product page. Redirect old links.
export const Route = createFileRoute("/checkout/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/p/$slug", params: { slug: params.slug } });
  },
  component: () => null,
});
