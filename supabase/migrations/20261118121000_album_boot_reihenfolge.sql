-- Sammelalbum (Jazz 2026-11-18): Boot und Brunnen sind die breitesten Sticker und klebten nebeneinander (überlappten).
-- Das Boot rückt in der Reihenfolge nach hinten, neben kleine Sticker (Frosch davor, Zeilenende danach). Gilt auch für die Reihenfolge im Shop.
update public.shop_artikel set reihenfolge = 75 where id = 'geschenk';
update public.shop_artikel set reihenfolge = 74 where id = 'kuerbisgesicht';
update public.shop_artikel set reihenfolge = 73 where id = 'boot';
