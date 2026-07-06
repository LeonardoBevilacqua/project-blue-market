# Current approach to handle

In the page "Compras mensais", I've two tables, one for grocery ("Compras") and other for pet store ("Compras pet"), both using the same template and flow.

## Template

The table has the following columns:
- "Name". Helps identify the product.
- "Date". When the item was bought. Set individually per item, Could be improved with the new app.
- "Item". A select box with the type of the item, for exemple "Rice", "Beans" or "pet toy".
- "Quantidade". Integer value of the quantity bought, used to calculate the "Total". Could be improved to be float value to handle quantity by weight.
- "Valor". The unit value of the item, used to calculate the "Total".
- "Total". The final price payed for the item.

Each row represents a distinct item, and they are implicitly grouped by the date. There is no information from where it was bought, this could be added to group them.
The table has views and groups. The first view is a filtering which I can select a product "Item" and check the previous values along with average.
The other views are filters by "Date" between, starting from the big grocery shopping of the month, usually between the first Saturday after the 25Th of each month.

## Flow

There are two flows, Grocery list and after grocery.

### Grocery list

A initial draft item is created with a generic "Name" along with "Date", "Item" and "Quantidade", while "Valor" is zero.
During grocery, the "Valor" is updated and new items can be added.
After finished, the items are updated with actual "Name" and "Valor" from the receipt.

### After grocery

Is added items from the receipt after the grocery is done, without prior registration.
