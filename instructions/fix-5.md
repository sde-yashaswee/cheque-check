1. http://localhost:3000/parties/96df6292-81d0-4bbb-8dd5-4419ac919cb1 Implement a party-wise detail page where we can show the checks filtered by the party. This page should show all the checks filtered by the party. Something along those lines we should show. Okay, so implement this page. 
2. Remove the business selector from the home page. Add a chevron-down icon to the width strip below the top navbar, allowing us to change the business from that pop-up. 
3. In the drop-down box for searching the party and the bank account, we are getting two “Add New Party” options. One is inside the drop-down and one is on the card. Pick either one and keep only one; do not keep both. It’s very confusing for both the bank and the party selector. 

## Error Type
Recoverable Error

## Error Message
Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <LoadingBoundary name="/" loading={null}>
      <HTTPAccessFallbackBoundary notFound={{...}} forbidden={undefined} unauthorized={undefined}>
        <HTTPAccessFallbackErrorBoundary pathname="/parties" notFound={{...}} forbidden={undefined} ...>
          <RedirectBoundary>
            <RedirectErrorBoundary router={{...}}>
              <InnerLayoutRouter url="/parties" tree={[...]} params={{}} cacheNode={{rsc:{...}, ...}} segmentPath={[...]} ...>
                <SegmentViewNode type="layout" pagePath="(dashboard...">
                  <SegmentTrieNode>
                  <script>
                  <script>
                  <DashboardLayout>
                    <div className="flex min-h...">
                      <TopNav>
                      <main>
                      <BottomNav>
                        <nav className="fixed bott...">
                          <LinkComponent>
                          <LinkComponent>
                          <LinkComponent>
                          <LinkComponent href="/settings" className="flex flex-...">
                            <a
                              className="flex flex-col items-center justify-center gap-1 transition-colors text-muted-..."
                              ref={function}
                              onClick={function onClick}
                              onMouseEnter={function onMouseEnter}
                              onTouchStart={function onTouchStart}
+                             href="/settings"
-                             href="/features"
                            >
                              <Settings className="h-5 w-5">
                                <svg
                                  ref={null}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
+                                 className="lucide lucide-settings h-5 w-5"
-                                 className="lucide lucide-layout-grid h-5 w-5"
                                  aria-hidden="true"
                                >
+                                 <path
+                                   d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 ..."
+                                 >
-                                 <rect width="7" height="7" x="3" y="3" rx="1">
                                  ...
                              ...
              ...



    at path (<anonymous>:null:null)
    at <unknown> (src/components/bottom-nav.tsx:31:13)
    at Array.map (<anonymous>:null:null)
    at BottomNav (src/components/bottom-nav.tsx:20:17)
    at DashboardLayout (src/app/(dashboard)/layout.tsx:15:7)

## Code Frame
  29 |             )}
  30 |           >
> 31 |             <item.icon className="h-5 w-5" />
     |             ^
  32 |             <span className="text-[10px] font-medium">{item.name}</span>
  33 |           </Link>
  34 |         )

Next.js version: 16.3.0 (Turbopack)


5. WHWNEVER WE OPEN A NEW PAGE, please scroll back to the top.