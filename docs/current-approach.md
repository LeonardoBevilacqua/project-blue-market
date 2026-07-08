# Current approach

In the page "Compras mensais", I have two tables, one for grocery ("Compras") and the other for pet store ("Compras pet"), both using the same template and flow.

## Template

The table has the following columns:
- "Name". Helps identify the product.
- "Date". When the item was bought. Set individually per item. Could be improved with the new app.
- "Item". A select box with the type of the item, for example "Rice", "Beans" or "pet toy".
- "Para". A select box with the location where the item will be stored.
- "Quantidade". Integer value of the quantity bought, used to calculate the "Total". Could be improved to be floating-point value to handle quantity by weight.
- "Valor". The unit value of the item, used to calculate the "Total".
- "Total". The final price paid for the item.

Each row represents a distinct item, and they are implicitly grouped by the date. There is no information about where it was bought. This could be added to group them.
The table has views and groups. The first view is a filter where I can select a product ("Item") and check its previous values along with average.
The other views filter by a date range, starting from the big monthly grocery shopping, which usually happens on the first Saturday after the 25th of each month.

## Flow

There are two flows, Grocery list and after grocery.

### Grocery list

An initial draft item is created with a generic "Name" along with "Date", "Item" and "Quantidade", while "Valor" is zero.
During grocery, the "Valor" is updated and new items can be added.
After finished, the items are updated with actual "Name" and "Valor" from the receipt.

### After grocery

Items from the receipt are added after the grocery is done, without prior registration.
