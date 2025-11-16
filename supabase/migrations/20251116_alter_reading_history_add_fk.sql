do $$
begin
  if to_regclass('public.reading_history') is not null and to_regclass('public.books') is not null then
    alter table public.reading_history
      add constraint reading_history_book_fk
      foreign key (book_id)
      references public.books(id)
      on delete cascade
      not valid;
  end if;
end $$;