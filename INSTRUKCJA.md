# szlaq — instalacja na iPhonie

1. Otwórz stronę aplikacji w **Safari**.
2. Wybierz **Udostępnij → Do ekranu początkowego**.
3. Włącz otwieranie jako aplikację www i naciśnij **Dodaj**.
4. Uruchom ikonę **szlaq** z ekranu telefonu.
5. Wybierz **Importuj Excel** i plik z aplikacji Pliki.
6. W Ustawieniach wpisz bazę — miejsce startu i codziennego powrotu.
7. Naciśnij żółty przycisk **Policz odległości** w pasku dnia (darmowy OSRM) — pojawią się czasy dojazdu i podpowiedzi „co jest po drodze”.
8. Wybierz dzień u góry. Trasa dnia to oś czasu: start → przystanki → **Następny przystanek** → powrót. Dokładaj kolejne punkty przyciskiem „+” (najbliższy jest wyróżniony) albo klikając pinezki na mapie; na telefonie przełączasz **Lista | Mapa**. Stuknięcie w przystanek rozwija jego akcje (szczegóły, miejsce pracy, notatka, inny dzień, kolejność, usunięcie). W przypiętym pasku dnia masz sumy (czas, kilometry, powrót), **Optymalizuj** (najkrótsza kolejność) i **Prowadź całą trasę** w Google Maps; okrągła strzałka przy przystanku prowadzi do jednego punktu. Czerwony znacznik oznacza punkt w odległości poniżej 20 minut jazdy od trasy (widoczny po policzeniu odległości). Zielony przycisk z ptaszkiem oznacza przystanek jako zrobiony — wypada on wtedy z trasy do zwiniętego wiersza „Zrobione” na górze (tam też „Cofnij”), a kafelek dnia pokazuje, ile zostało. Po stuknięciu w przystanek pokazują się trzy stany: zielone **Zrobione**, żółte **Na później** (punkt wypada z trasy i z podpowiedzi, ale zostaje na liście — znajdziesz go w zwiniętej grupie „Na później”, jednym przyciskiem wraca do dnia) i czerwone **Usuń zlecenie** (kasuje zlecenie z telefonu, po potwierdzeniu, bez powrotu). Na pasku mapy jest też przycisk z celownikiem **Gdzie jestem** — pokazuje Twoją pozycję na mapie (niebieska kropka z kółkiem dokładności); ten sam przycisk masz w oknie „Zobacz miejsce pracy”.

Nie ma ustawiania przerw. Tydzień obejmuje pięć dni roboczych (Pon–Pt) — soboty i niedzieli nie ma wśród kafelków dni. Bez płatności ani konta rozliczeniowego — trasy zawsze liczy darmowy OSRM.

**Aktualizacje:** aplikacja sama sprawdza nową wersję, gdy wraca na ekran (np. po przełączeniu z innej aplikacji), więc zwykle wystarczy mieć internet i chwilę poczekać, aż na górze pojawi się pasek „Dostępna nowa wersja”. Jeśli mimo to go nie widać, w pełni zamknij szlaq (przeciągnij w górę w przełączniku aplikacji) i otwórz ikonę ponownie.

## Nocleg i składy kruszywa

Na końcu trasy dnia, w wierszu „Powrót do bazy”, jest przycisk **Nocleg** (księżyc) — zaznacz, jeśli ekipa zostaje na noc; pojawi się odnośnik do Booking.com, a kolejny dzień wystartuje z tego miejsca zamiast z bazy. Składy kruszywa i kamienia znajdziesz w szczegółach zlecenia (w pobliżu punktu) i pod ikoną góry na pasku mapy (po drodze całego dnia), przez Google Maps i OpenStreetMap.

## Zobacz miejsce pracy i notatki

Przy każdym przystanku jest przycisk „Zobacz miejsce pracy”. Mapa pokazuje się od razu, tuż pod jednym rzędem podkładów (Ulice, dwa warianty satelitarne — szybszy Esri i nowszy GUGiK, oraz Google i Google hybryda) z pomarańczowym okrągłym przyciskiem Street View obok. Pod mapą jest przewijany w poziomie rząd „działki” + sieci uzbrojenia terenu (prąd, gaz, wodociąg, kanalizacja i inne, z rejestru GESUT) — jedna wąska belka zamiast całej siatki checkboxów. Zamiast przycisku „Start” jest „Dodaj notatkę” — notatka od razu pokazuje się przy tym punkcie na liście.

Po włączeniu działek kursor na mapie zmienia się, żeby było widać, że można kliknąć — kliknięcie podświetla na żółto działkę pod tym punktem i pokazuje jej numer w dymku.

## Usuwanie importu

W zakładce Import przy każdym wczytanym pliku jest przycisk usuwania — kasuje wszystkie zlecenia z tego konkretnego pliku (po potwierdzeniu). Zlecenia z innych importów zostają bez zmian.

## Dla drugiego telefonu

Naciśnij **Przekaż plan**. Wyślij plik koledze lub zapisz go w aplikacji Pliki. Na drugim telefonie w szlaq wybierz **Import → Wczytaj plan od kolegi**. Każdy telefon ma własny zapis. Zmiany nie synchronizują się automatycznie.

## Bez internetu

Otwórz aplikację raz z dostępem do sieci, aby zapisała swoje pliki. Potem możesz czytać opisy i zapisywać statusy bez zasięgu. Nowe obliczenia tras, wyszukiwanie adresów i pobieranie map wymagają połączenia. Czasy przejazdów są szacowane bez bieżących korków.

## Co zawiera ZIP

Komplet statycznych plików do opublikowania na hostingu HTTPS, np. GitHub Pages. Nie musisz kupować hostingu ani domeny. Pliku ZIP nie instaluje się bezpośrednio na iPhonie — telefon instaluje aplikację z opublikowanego adresu strony. Otwarcie `index.html` z dysku nie zapewnia działania PWA.

Excel oraz kopie planu są przechowywane na telefonie, a nie we wspólnym repozytorium. Wyczyszczenie danych witryny usuwa zapis. Używaj przycisku **Przekaż plan**, aby zachować kopię.
