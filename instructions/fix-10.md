1. Create a separate bank selector component so we can select a bank from there. Right now it shows the ID when I select something, which doesn’t look great in the UI. Make a selector similar to the party selector for the bank selector. Now, secondly, the bank name would never be stored in the database as text. Remove it. Only the bank ID will be there, and the bank ID will contain the bank name itself. So we'll use that bank name only. No, we won't be writing the bank name manually on the UI. 

2. http://localhost:3000/businesses On the businesses page, the top has “Management My Businesses”; just remove it. It doesn’t require that anyway. Also, on the top navbar, “Businesses” should be shown. Right now it is showing “Dashboard,” which is wrong. Fix that.

3. In both the Accounts and Businesses pages, the search bar is missing, unlike on the Checks and Parties pages. The search bar and sort button should be present. On the Accounts page, add sorting by account name and filtering by bank. On the Businesses page, include a search bar, sorting by name, and options for ascending and descending order. 

4. On the delete dialog box, the cancel button is not required. Use a single “Delete permanently” button. The X button at the top closes the dialog. Whatever is written after the type : 'xyz' should be in mono font.

5. In Parties, between the cards add some spacing, so it looks good, like keep it consitent accors the app.

6.On the homepage, replace the cards for cleared, bounced, received, and issued with a pie chart. Use Recharts from ChatC and the best-looking charts available. Show the bounced, cleared, issued, and received data in the pie chart, with the legend displayed on the chart itself. Keep the "today upcoming overdue" section in the card format. A pie chart should be sufficient. 

7. On the account-specific page we have a card. It looks good when we open that page; the account-specific page shows a card with an edit button, and everything is within the card. However, on the party-specific page there is no card. Please add a card at the top of the party-specific page. The details are currently scattered, but they should be placed in a card. 

8. Today's check section should be above the STATSITTICS cards.

9. In the quick action as of now, keep two actions only: one is issued check and one is received check. These businesses and accounts, and these parties, are not required because it's already in the tab. So two main options should be there. 

