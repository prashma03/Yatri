insert into public.content_items (content_key, category, title, body, source_name, source_url, reviewed_at, published)
values
  ('emergency-tourist-police', 'emergency', 'Nepal Tourist Police', '{"phone":"1144","alternate":"+977-1-4247041"}', 'Nepal Tourism Board', 'https://ntb.gov.np/plan-your-trip/before-you-come/tourist-police', '2026-07-05T00:00:00Z', true),
  ('emergency-nepal-police', 'emergency', 'Nepal Police', '{"phone":"100","toll_free":"16600141516"}', 'Nepal Police', 'https://nepalpolice.gov.np/stations/emergency-contacts/', '2026-07-05T00:00:00Z', true),
  ('permit-restricted-areas', 'permit', 'Restricted-area trekking permits', '{"note":"Fees and routes can change; always verify with the Department of Immigration."}', 'Department of Immigration Nepal', 'https://immigration.gov.np/trekking-route-and-permit-fee', '2026-07-05T00:00:00Z', true)
on conflict (content_key) do update set body = excluded.body, source_name = excluded.source_name, source_url = excluded.source_url, reviewed_at = excluded.reviewed_at, published = excluded.published, updated_at = now();
