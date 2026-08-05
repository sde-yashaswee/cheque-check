Fix these issues : 

## Error Type
Console Error

## Error Message
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.

  ...
    <div className="space-y-8">
      <div className="space-y-3">
        <h3>
        <div className="divide-y r...">
          <div className="flex items..." onClick={undefined}>
            <div>
            <Combobox options={[...]} value={undefined} onValueChange={function onValueChange} className="h-9 w-[120px]">
              <Popover open={false} onOpenChange={function bound dispatchSetState}>
                <PopoverRoot data-slot="popover" open={false} onOpenChange={function bound dispatchSetState}>
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
>                           id="base-ui-_r_6_"
>                           aria-haspopup="dialog"
>                           aria-expanded={false}
>                           aria-controls={undefined}
>                           data-slot="popover-trigger"
>                           asChild={true}
>                           ref={function}
>                         >
                            <Button variant="outline" role="combobox" aria-expanded={false} className="justify-be...">
                              <Button data-slot="button" className={"group/bu..."} role="combobox" aria-expanded={false}>
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
>                                 role="combobox"
>                                 aria-expanded={false}
>                                 ref={function}
>                                 className={"group/button inline-flex shrink-0 items-center rounded-lg border bg-cli..."}
>                               >
                      ...
          ...
      ...



    at button (<anonymous>:null:null)
    at Button (src/components/ui/button.tsx:50:5)
    at Combobox (src/components/ui/combobox.tsx:44:9)
    at SettingsPage (src/app/(dashboard)/settings/page.tsx:64:13)

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
    at Combobox (src/components/ui/combobox.tsx:43:7)
    at SettingsPage (src/app/(dashboard)/settings/page.tsx:64:13)

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
    at Combobox (src/components/ui/combobox.tsx:43:7)
    at SettingsPage (src/app/(dashboard)/settings/page.tsx:64:13)

## Code Frame
  11 |
  12 | function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
> 13 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
     |          ^
  14 | }
  15 |
  16 | function PopoverContent({

Next.js version: 16.3.0 (Turbopack)


1. On Cheque's Page : Filter Button is not working : http://localhost:3000/cheques
2. Reminder frequency, the number of reminders per day, and whether the receiving check mode is enabled should also be part of the settings and be able to do CRUD on the settings page itself. 
3. Skeleton loaders for all major four pages—the home page, the checks, the parties, the banks, and the settings page—should have a loading skeleton effect. Implement this loading skeleton effect. 
4. Implement the top navbar concept with the application name “CheckCheck” and the user avatar on the right side. The page names should appear only in the top navbar, not on the page itself. For example, when opening the Checks page, the options “Checks,” “Parties,” “Create New Party,” and “Create New Check” should be on the top navbar only. With a Button to Navigate Back to the Previous Screen.
5. When I create a new business and switch to it, it does not happen. It does not even show in the switch business card on the pop‑up. Make sure the business query is invalidated and the UI updates according to the business we are actually on. Always check which business we are standing on. 