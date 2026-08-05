1. Authentication : Sign in With google and facebook with supabase on the login and signup.
2. ## Error Type
Console Error

## Error Message
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.

  ...
    <SegmentViewNode type="page" pagePath="(dashboard...">
      <SegmentTrieNode>
      <ClientPageRoot Component={function ChequesPage} serverProvidedParams={{...}}>
        <ChequesPage params={Promise} searchParams={Promise}>
          <div className="mx-auto ma...">
            <div className="flex gap-2">
              <div>
              <Popover>
                <PopoverRoot data-slot="popover">
                  <FloatingTree>
                    <PopoverRootComponent props={{...}}>
                      <PopoverTrigger asChild={true}>
                        <PopoverTrigger data-slot="popover-tr..." asChild={true}>
>                         <button
>                           type="button"
>                           onClick={function}
>                           onMouseDown={function}
>                           onKeyDown={function}
>                           onKeyUp={function}
>                           onPointerDown={function}
>                           tabIndex={0}
>                           disabled={false}
>                           data-base-ui-click-trigger=""
>                           id="base-ui-_R_3spbn5rl5rlb_"
>                           aria-haspopup="dialog"
>                           aria-expanded={false}
>                           aria-controls={undefined}
>                           data-slot="popover-trigger"
>                           asChild={true}
>                           ref={function}
>                         >
                            <Button variant="outline" className="rounded-fu..." size="icon">
                              <Button data-slot="button" className={"group/bu..."}>
>                               <button
>                                 type="button"
>                                 onClick={function}
>                                 onMouseDown={function}
>                                 onKeyDown={function}
>                                 onKeyUp={function}
>                                 onPointerDown={function}
>                                 tabIndex={0}
>                                 disabled={false}
>                                 data-slot="button"
>                                 ref={function}
>                                 className={"group/button inline-flex shrink-0 items-center justify-center border bg..."}
>                               >
                      ...
            ...



    at button (<anonymous>:null:null)
    at Button (src/components/ui/button.tsx:50:5)
    at ChequesPage (src/app/(dashboard)/cheques/page.tsx:61:13)

## Code Frame
  48 | }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  49 |   return (
> 50 |     <ButtonPrimitive
     |     ^
  51 |       data-slot="button"
  52 |       className={cn(buttonVariants({ variant, size, className }))}
  53 |       {...props}

Next.js version: 16.3.0 (Turbopack)

## Error Type
Console Error

## Error Message
<button> cannot contain a nested <button>.
See this log for the ancestor stack trace.


    at button (<anonymous>:null:null)
    at PopoverTrigger (src/components/ui/popover.tsx:13:10)
    at ChequesPage (src/app/(dashboard)/cheques/page.tsx:60:11)

## Code Frame
  11 |
  12 | function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
> 13 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
     |          ^
  14 | }
  15 |
  16 | function PopoverContent({

Next.js version: 16.3.0 (Turbopack)

## Error Type
Console Error

## Error Message
React does not recognize the `asChild` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `aschild` instead. If you accidentally passed it from a parent component, remove it from the DOM element.


    at button (<anonymous>:null:null)
    at PopoverTrigger (src/components/ui/popover.tsx:13:10)
    at ChequesPage (src/app/(dashboard)/cheques/page.tsx:60:11)

## Code Frame
  11 |
  12 | function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
> 13 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
     |          ^
  14 | }
  15 |
  16 | function PopoverContent({

Next.js version: 16.3.0 (Turbopack)

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


    at button (<anonymous>:null:null)
    at Button (src/components/ui/button.tsx:50:5)
    at ChequesPage (src/app/(dashboard)/cheques/page.tsx:61:13)

## Code Frame
  48 | }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  49 |   return (
> 50 |     <ButtonPrimitive
     |     ^
  51 |       data-slot="button"
  52 |       className={cn(buttonVariants({ variant, size, className }))}
  53 |       {...props}

Next.js version: 16.3.0 (Turbopack)

## Error Type

3. Feature tab should not be on the bottom navbar. Features belong on the Settings page. When you click on a specific card—like “My Businesses”—the Features page opens. It should not be on the bottom navbar. 

4. The Plus Icon on the FAB Button on the Cheques, Parties, Pages, (first of all add this FAB button to the http://localhost:3000/businesses page as well, instead of putting it at the top.) should be big, in the button.

5. Also, Show Number of Cheques also in each business card in the  http://localhost:3000/businesses page.

6. When Choosing a Party or a Bank, Then it should allow creating new parties or banks as well. For example, if they search for something like ICICI and it is not available, they can click the drop‑down and create a new party there. This transitions them to a new page where they can add the party. Once the party is added, they return to the original page and can search for ICICI again; it will appear, or it may be selected as a new object altogether. 

7. Make sure the switch business pop-up is not a very weird shape; it should be rectangular with rounded corners.

8. Export Cheques button i snot working in the settings page, fix this.
9. On On the form, don't write "optional." Use a red asterisk, okay? If something is required or important, just put an asterisk. Do not write "optional" and all that. Red asterisk. 
10. Reminder Preferences should be on the aettings page only.
11. On th Global Search Bar there are two cross buttons on the top right corner.