-- ETHIO Foods — starter catalog. Only details visible on actual packaging are filled in.
-- Ingredients and nutrition stay empty until the business verifies them.

insert into public.product_categories (slug, name, sort_order) values
  ('lentils-pulses', 'Lentils & pulses', 1),
  ('seeds', 'Seeds', 2),
  ('grains', 'Grains', 3),
  ('beans', 'Beans', 4)
on conflict (slug) do nothing;

insert into public.products (slug, name, package_name, category_id, short_description, geez_name, geez_latin, uses, grain_style, is_featured, sort_order)
values
  ('red-lentils', 'Red Lentils', 'Football Red Lentils', (select id from public.product_categories where slug = 'lentils-pulses'),
   'Split red lentils that cook down soft and quick. The base for misir wot, soups and everyday dal.', 'ምስር', 'misir',
   array['Misir wot', 'Soups', 'Stews', 'Dal'], 'lentil', true, 1),
  ('brown-flaxseeds', 'Brown Flaxseeds', 'Brown Flax Seeds', (select id from public.product_categories where slug = 'seeds'),
   'Whole brown flaxseeds for telba, baking, smoothies and breakfast bowls. Grind just before use for the best flavor.', 'ተልባ', 'telba',
   array['Telba drink', 'Bread and baking', 'Smoothies', 'Oatmeal'], 'flax', true, 2),
  ('split-fava-beans', 'Split Fava Beans', 'Split Fava Beans', (select id from public.product_categories where slug = 'beans'),
   'Split broad beans with the skins removed, ready for ful, hearty soups and slow stews.', 'ባቄላ', 'bakela',
   array['Ful', 'Soups', 'Stews'], 'fava', true, 3),
  ('bulgur-wheat', 'Bulgur Wheat', 'Bulgur Wheat', (select id from public.product_categories where slug = 'grains'),
   'Cracked wheat for kinche, salads and pilafs. Ask us about grind and package sizes.', null, null,
   array['Kinche', 'Salads', 'Pilaf'], 'bulgur', false, 4),
  ('beans', 'Beans', 'Beans', (select id from public.product_categories where slug = 'beans'),
   'Dried beans for home cooking and food service. Ask which varieties are in stock.', null, null,
   array['Stews', 'Soups', 'Salads'], 'bean', false, 5)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, label, net_weight, upc, is_default, sort_order)
select id, '2 LB', '2 LB', '7 41654 43996 8', true, 1 from public.products where slug = 'red-lentils'
union all
select id, '2 LB', '2 LB', '7 41654 44001 8', true, 1 from public.products where slug = 'brown-flaxseeds'
union all
select id, '2 LB', '2 LB (907 g)', null, true, 1 from public.products where slug = 'split-fava-beans';

insert into public.product_images (product_id, src, alt, kind, sort_order)
select p.id, v.src, v.alt, v.kind, v.ord from public.products p
join (values
  ('red-lentils', '/images/lentils-photo.webp', 'ETHIO Football Red Lentils 2 lb bag on a store shelf', 'actual', 1),
  ('red-lentils', '/images/lentils-label.webp', 'Close-up of the ETHIO red lentils label with nutrition panel', 'actual', 2),
  ('red-lentils', '/images/lentils-concept.webp', 'Package design concept for ETHIO split red lentils', 'concept', 3),
  ('brown-flaxseeds', '/images/flax-photo.webp', 'ETHIO Brown Flax Seeds 2 lb bag held in a store aisle', 'actual', 1),
  ('brown-flaxseeds', '/images/flax-label.webp', 'Close-up of the ETHIO brown flax seeds label', 'actual', 2),
  ('brown-flaxseeds', '/images/flax-concept-front.webp', 'Package design concept for ETHIO flax seeds, front', 'concept', 3),
  ('brown-flaxseeds', '/images/flax-concept-back.webp', 'Package design concept for ETHIO flax seeds, back', 'concept', 4),
  ('split-fava-beans', '/images/fava-concept.webp', 'Package design concept for ETHIO split fava beans 2 lb', 'concept', 1)
) as v(slug, src, alt, kind, ord) on v.slug = p.slug;

insert into public.site_settings (key, value, is_public) values
  ('contact', '{"company":"B&E Wholesale LLC","city":"Sterling","state":"Virginia","email":null,"phone":null,"hours":null}', true),
  ('announcement', '{"enabled":false,"text":""}', true),
  ('home.hero', '{"lede":"ETHIO packs everyday pulses, grains and seeds for home kitchens, grocery shelves and restaurants. Pick what you need and send a request. We confirm price, stock and delivery with you directly."}', true),
  ('about.story', '{"body":"ETHIO is the packaged-food brand of B&E Wholesale LLC, based in Sterling, Virginia. We pack the lentils, beans, seeds and grains that families cook with every week and supply them to households, stores and restaurants."}', true)
on conflict (key) do nothing;
