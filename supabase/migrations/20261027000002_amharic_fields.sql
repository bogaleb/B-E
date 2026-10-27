-- Amharic text for products and categories (shown when visitors switch the site to Amharic).
alter table public.products add column if not exists name_am text check (char_length(name_am) <= 120);
alter table public.products add column if not exists short_description_am text check (char_length(short_description_am) <= 400);
alter table public.products add column if not exists uses_am text[] not null default '{}';
alter table public.product_categories add column if not exists name_am text check (char_length(name_am) <= 80);

-- Starter translations (review with a native speaker; edit any time in the dashboard)
update public.products set name_am = 'ቀይ ምስር', short_description_am = 'በቀላሉ የሚበስልና የሚለሰልስ የተከካ ቀይ ምስር። ለምስር ወጥ፣ ለሾርባና ለዕለት ምግብ።', uses_am = array['ምስር ወጥ','ሾርባ','ወጥ','ዳል'] where slug = 'red-lentils' and name_am is null;
update public.products set name_am = 'ቡናማ ተልባ', short_description_am = 'ለተልባ መጠጥ፣ ለዳቦ፣ ለስሙዚና ለቁርስ የሚሆን ሙሉ ቡናማ ተልባ። ለተሻለ ጣዕም ከመጠቀምዎ በፊት ይፍጩት።', uses_am = array['የተልባ መጠጥ','ዳቦና መጋገሪያ','ስሙዚ','አጥሚት'] where slug = 'brown-flaxseeds' and name_am is null;
update public.products set name_am = 'የተከካ ባቄላ', short_description_am = 'ቅርፊቱ የተላጠ የተከካ ባቄላ፤ ለፉል፣ ለሾርባና ለወጥ ዝግጁ።', uses_am = array['ፉል','ሾርባ','ወጥ'] where slug = 'split-fava-beans' and name_am is null;
update public.products set name_am = 'ቡልጉር ስንዴ', short_description_am = 'ለቅንጬ፣ ለሰላጣና ለፒላፍ የሚሆን የተፈተገ ስንዴ። ስለ ፍተጋውና ስለ ማሸጊያ መጠኑ ይጠይቁን።', uses_am = array['ቅንጬ','ሰላጣ','ፒላፍ'] where slug = 'bulgur-wheat' and name_am is null;
update public.products set name_am = 'ቦሎቄ', short_description_am = 'ለቤት ማብሰያና ለምግብ ቤቶች የደረቀ ቦሎቄ። የትኞቹ ዓይነቶች እንዳሉ ይጠይቁ።', uses_am = array['ወጥ','ሾርባ','ሰላጣ'] where slug = 'beans' and name_am is null;
update public.product_categories set name_am = 'ምስርና ጥራጥሬ' where slug = 'lentils-pulses' and name_am is null;
update public.product_categories set name_am = 'ዘሮች' where slug = 'seeds' and name_am is null;
update public.product_categories set name_am = 'እህሎች' where slug = 'grains' and name_am is null;
update public.product_categories set name_am = 'ባቄላ' where slug = 'beans' and name_am is null;
