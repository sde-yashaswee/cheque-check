1. There is a THIRD STEP in the Onboarding that is to select the Reminder Preferences, and for onboaridng alos, please use the Selectors, form the settings page, so it looks consistent.
2. Again to Implement the Business Switcher as a dropdown thing, the Strip is cut in half Below the nabba, the strip is cut in half again because of using the dialog box. I want a dialog box of the shared scene, which is fine, but why are you cutting it in half? Please extend it to the right edge of the screen. 
3. When creating a new check, new party, new account, or new business, the continue button should validate the current form elements. Validation should occur on every step, not just on the final continue button, so users can only move forward when the form is valid. 
4. Please do not do a custom implementation of the delete dialog box. Use the shads in the popup component only. Use whatever props they have given to implement this dialog box, and make the buttons proper, including the delete permanently button. 
5. In the Settings > Management section, my account should not be there; only My Businesses and My Features tabs should be present. Remove that account because it’s already in the bottom navigation bar tab. 
6. Add a short button on the Parties page to sort by name in ascending or descending order, please. You can implement this in the bottom sheet also, bottom sheet sorting. 

## Error Type
Console Error

## Error Message
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.

  ...
    <DashboardLayout>
      <OnboardingCheck>
        ...
          <div className="sticky top...">
            <header>
            <BusinessSwitcher trigger={<button>}>
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
>                           id="base-ui-_r_1_"
>                           aria-haspopup="dialog"
>                           aria-expanded={false}
>                           aria-controls={undefined}
>                           data-slot="popover-trigger"
>                           asChild={true}
>                           ref={function}
>                         >
>                           <button
>                             className="flex h-7 items-center border-b bg-primary/5 px-4 text-[10px] font-bold text-p..."
>                           >
                      ...
            ...



    at button (<anonymous>:null:null)
    at TopNav (src/components/top-nav.tsx:77:13)
    at DashboardLayout (src/app/(dashboard)/layout.tsx:15:9)

## Code Frame
  75 |         <BusinessSwitcher 
  76 |           trigger={
> 77 |             <button className="flex h-7 items-center border-b bg-primary/5 px-4 text-[10px] font-bold text-primary uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-primary/10 active:bg-primary/20">
     |             ^
  78 |               <span className="opacity-60 mr-1.5">Business:</span> 
  79 |               {activeBusiness.name}
  80 |               <ChevronDown className="ml-1.5 h-3 w-3 opacity-60" />

Next.js version: 16.3.0 (Turbopack)

## Error Type
Console Error

## Error Message
<button> cannot contain a nested <button>.
See this log for the ancestor stack trace.


    at button (<anonymous>:null:null)
    at PopoverTrigger (src/components/ui/popover.tsx:13:10)
    at BusinessSwitcher (src/components/business-switcher.tsx:21:7)
    at TopNav (src/components/top-nav.tsx:75:9)
    at DashboardLayout (src/app/(dashboard)/layout.tsx:15:9)

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
    at BusinessSwitcher (src/components/business-switcher.tsx:21:7)
    at TopNav (src/components/top-nav.tsx:75:9)
    at DashboardLayout (src/app/(dashboard)/layout.tsx:15:9)

## Code Frame
  11 |
  12 | function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
> 13 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
     |          ^
  14 | }
  15 |
  16 | function PopoverContent({

Next.js version: 16.3.0 (Turbopack)

When I click on the global search bar, the global magnifying icon button displays this error. 
## Error Type
Runtime TypeError

## Error Message
Cannot read properties of undefined (reading 'subscribe')


    at CommandInput (src/components/ui/command.tsx:72:9)
    at GlobalSearch (src/components/global-search.tsx:67:7)
    at TopNav (src/components/top-nav.tsx:86:7)
    at DashboardLayout (src/app/(dashboard)/layout.tsx:15:9)

## Code Frame
  70 |     <div data-slot="command-input-wrapper" className="p-1 pb-0">
  71 |       <div className="relative flex items-center h-8! rounded-lg! border border-input/30 bg-input/30 shadow-none!">
> 72 |         <CommandPrimitive.Input
     |         ^
  73 |           data-slot="command-input"
  74 |           className={cn(
  75 |             "w-full px-8 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",

Next.js version: 16.3.0 (Turbopack)


Add an option to upload, like the scan the check. So basically this would open the camera component, allowing us to upload a byte image by taking a picture. It should work with Supabase storage, and we can associate the image with the checks. 