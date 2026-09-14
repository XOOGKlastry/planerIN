# PaczkoPlan — instalacja na iPhonie

1. Otwórz stronę aplikacji w **Safari**.
2. Wybierz **Udostępnij → Do ekranu początkowego**.
3. Włącz otwieranie jako aplikację www i naciśnij **Dodaj**.
4. Uruchom ikonę **PaczkoPlan** z ekranu telefonu.
5. Wybierz **Importuj Excel** i plik z aplikacji Pliki.
6. W Ustawieniach wpisz bazę — miejsce startu i codziennego powrotu.
7. Naciśnij **Policz odległości**, żeby zobaczyć podpowiedzi „co jest po drodze” (domyślnie darmowy OSRM).
8. Na każdy dzień sam wybierz pierwszy przystanek — z podpowiedzianej listy albo klikając pinezkę wprost na mapie — a potem kolejne w kolejności klikania/dodawania. Każdy dzień ma na mapie swój kolor (widać go też na kafelku dnia), więc od razu wiadomo, do którego dnia należy dana pinezka; kliknięcie pinezki innego dnia przenosi ją na dzień, który akurat oglądasz. Na górze ekranu, zawsze widoczny, jest przycisk **Optymalizuj trasę** — układa już dodane przystanki w najkrótszą kolejność (aktywny od 2 przystanków). Przy nagłówku dnia jest **Reset dnia** (usuwa wszystkie przystanki z dnia, po potwierdzeniu). Przycisk **Prowadź** otwiera Google Maps. Gdy dwa punkty w tygodniu dzieli mniej niż 20 minut jazdy, oba dostają czerwone ostrzeżenie z nazwą tego drugiego punktu (widoczne dopiero po policzeniu odległości).

Nie ma ustawiania przerw. Tydzień obejmuje pięć dni roboczych (Pon–Pt) — soboty i niedzieli nie ma wśród kafelków dni. Bez płatności ani konta rozliczeniowego — trasy zawsze liczy darmowy OSRM.

**Aktualizacje:** aplikacja sama sprawdza nową wersję, gdy wraca na ekran (np. po przełączeniu z innej aplikacji), więc zwykle wystarczy mieć internet i chwilę poczekać, aż na górze pojawi się pasek „Dostępna nowa wersja”. Jeśli mimo to go nie widać, w pełni zamknij PaczkoPlan (przeciągnij w górę w przełączniku aplikacji) i otwórz ikonę ponownie.

## Nocleg i składy kruszywa

Przy ostatnim przystanku dnia jest przycisk „Nocleg tutaj zamiast powrotu” — zaznacz, jeśli ekipa zostaje na noc; pojawi się odnośnik do Booking.com, a kolejny dzień wystartuje z tego miejsca zamiast z bazy. Przy zleceniu i przy mapie dnia są przyciski do szukania składów kruszywa/kamienia — w pobliżu punktu albo po drodze całego dnia, przez Google Maps i OpenStreetMap.

## Zobacz miejsce pracy i notatki

Przy każdym przystanku jest przycisk „Zobacz miejsce pracy” — mapa z wyborem podkładu nad samą mapą (Ulice, dwa warianty satelitarne — szybszy Esri i nowszy GUGiK, oraz Google i Google hybryda), przełącznikiem działek ewidencyjnych i sieciami uzbrojenia terenu (prąd, gaz, wodociąg, kanalizacja i inne, z rejestru GESUT) plus pomarańczowy przycisk Street View. Zamiast przycisku „Start” jest „Dodaj notatkę” — notatka od razu pokazuje się przy tym punkcie na liście.

Po włączeniu działek kursor na mapie zmienia się, żeby było widać, że można kliknąć — kliknięcie podświetla na żółto działkę pod tym punktem i pokazuje jej numer w dymku.

## Usuwanie importu

W zakładce Import przy każdym wczytanym pliku jest przycisk usuwania — kasuje wszystkie zlecenia z tego konkretnego pliku (po potwierdzeniu). Zlecenia z innych importów zostają bez zmian.

## Dla drugiego telefonu

Naciśnij **Przekaż plan**. Wyślij plik koledze lub zapisz go w aplikacji Pliki. Na drugim telefonie w PaczkoPlan wybierz **Import → Wczytaj plan od kolegi**. Każdy telefon ma własny zapis. Zmiany nie synchronizują się automatycznie.

## Bez internetu

Otwórz aplikację raz z dostępem do sieci, aby zapisała swoje pliki. Potem możesz czytać opisy i zapisywać statusy bez zasięgu. Nowe obliczenia tras, wyszukiwanie adresów i pobieranie map wymagają połączenia. Czasy przejazdów są szacowane bez bieżących korków.

## Co zawiera ZIP

Komplet statycznych plików do opublikowania na hostingu HTTPS, np. GitHub Pages. Nie musisz kupować hostingu ani domeny. Pliku ZIP nie instaluje się bezpośrednio na iPhonie — telefon instaluje aplikację z opublikowanego adresu strony. Otwarcie `index.html` z dysku nie zapewnia działania PWA.

Excel oraz kopie planu są przechowywane na telefonie, a nie we wspólnym repozytorium. Wyczyszczenie danych witryny usuwa zapis. Używaj przycisku **Przekaż plan**, aby zachować kopię.
