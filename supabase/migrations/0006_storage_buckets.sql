insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('homepage-media', 'homepage-media', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_admin_write" on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());
create policy "product_images_admin_update" on storage.objects for update using (bucket_id = 'product-images' and is_admin());
create policy "product_images_admin_delete" on storage.objects for delete using (bucket_id = 'product-images' and is_admin());

create policy "homepage_media_public_read" on storage.objects for select using (bucket_id = 'homepage-media');
create policy "homepage_media_admin_write" on storage.objects for insert with check (bucket_id = 'homepage-media' and is_admin());
create policy "homepage_media_admin_update" on storage.objects for update using (bucket_id = 'homepage-media' and is_admin());
create policy "homepage_media_admin_delete" on storage.objects for delete using (bucket_id = 'homepage-media' and is_admin());
