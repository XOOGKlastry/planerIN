# PaczkoPlan — instalacja na iPhonie

1. Otwórz stronę aplikacji w **Safari**.
2. Wybierz **Udostępnij → Do ekranu początkowego**.
3. Włącz otwieranie jako aplikację www i naciśnij **Dodaj**.
4. Uruchom ikonę **PaczkoPlan** z ekranu telefonu.
5. Wybierz **Importuj Excel** i plik z aplikacji Pliki.
6. W Ustawieniach wpisz bazę — miejsce startu i codziennego powrotu.
7. Naciśnij **Policz odległości**, żeby zobaczyć podpowiedzi „co jest po drodze” (domyślnie darmowy OSRM).
8. Na każdy dzień sam wybierz pierwszy przystanek, a potem kolejne z podpowiedzianej listy — albo naciśnij **Zaproponuj rozkład**, żeby od razu rozłożyć resztę zleceń, i popraw ręcznie. Przycisk **Prowadź** otwiera Google Maps.

Nie ma ustawiania przerw ani wyboru dni roboczych — tydzień to zawsze 7 dni. Bez płatności ani konta rozliczeniowego — trasy zawsze liczy darmowy OSRM.

## Nocleg i składy kruszywa

Przy ostatnim przystanku dnia jest przycisk „Nocleg tutaj zamiast powrotu” — zaznacz, jeśli ekipa zostaje na noc; pojawi się odnośnik do Booking.com, a kolejny dzień wystartuje z tego miejsca zamiast z bazy. Przy zleceniu i przy mapie dnia są przyciski do szukania składów kruszywa/kamienia — w pobliżu punktu albo po drodze całego dnia, przez Google Maps i OpenStreetMap.

## Zobacz miejsce pracy i notatki

Przy każdym przystanku jest przycisk „Zobacz miejsce pracy” — mapa z opcjonalną ortofotomapą i sieciami uzbrojenia terenu (prąd, gaz, wodociąg, kanalizacja i inne, z rejestru GESUT) plus odnośnik do Street View. Zamiast przycisku „Start” jest „Dodaj notatkę” — notatka od razu pokazuje się przy tym punkcie na liście.

## Dla drugiego telefonu

Naciśnij **Przekaż plan**. Wyślij plik koledze lub zapisz go w aplikacji Pliki. Na drugim telefonie w PaczkoPlan wybierz **Import → Wczytaj plan od kolegi**. Każdy telefon ma własny zapis. Zmiany nie synchronizują się automatycznie.

## Bez internetu

Otwórz aplikację raz z dostępem do sieci, aby zapisała swoje pliki. Potem możesz czytać opisy i zapisywać statusy bez zasięgu. Nowe obliczenia tras, wyszukiwanie adresów i pobieranie map wymagają połączenia. Czasy przejazdów są szacowane bez bieżących korków.

## Co zawiera ZIP

Komplet statycznych plików do opublikowania na hostingu HTTPS, np. GitHub Pages. Nie musisz kupować hostingu ani domeny. Pliku ZIP nie instaluje się bezpośrednio na iPhonie — telefon instaluje aplikację z opublikowanego adresu strony. Otwarcie `index.html` z dysku nie zapewnia działania PWA.

Excel oraz kopie planu są przechowywane na telefonie, a nie we wspólnym repozytorium. Wyczyszczenie danych witryny usuwa zapis. Używaj przycisku **Przekaż plan**, aby zachować kopię.
