# PaczkoPlan

Aplikacja PWA dla ekipy montującej i serwisującej paczkomaty. Działa na iPhonie, Androidzie i komputerze. Nawigacja wyłącznie w Google Maps. W pełni bezpłatna — trasy liczy darmowy OSRM, bez kluczy i kont rozliczeniowych. Bez kont i bez ustawiania przerw.

## Pierwsze uruchomienie

1. Otwórz opublikowaną stronę w Safari na iPhonie.
2. Udostępnij → Do ekranu początkowego → Otwórz jako aplikację www → Dodaj.
3. Uruchom ikonę PaczkoPlan. Wczytaj Excel z aplikacji Pliki.
4. W Ustawieniach wybierz miejsce startu/powrotu. Tydzień pokazuje dni robocze Pon–Pt; nie ma soboty ani niedzieli.
5. Naciśnij żółty przycisk przeliczenia odległości w pasku dnia. Dla każdego dnia dokładaj kolejne przystanki z „Następny przystanek” (przycisk „+”) albo klikając pinezki na mapie; na koniec „Optymalizuj” poprawi kolejność.

Safari i PWA mogą mieć oddzielny zapis. Jeśli zaczynasz w Safari, zapisz kopię planu i wczytaj ją po instalacji. Plik ZIP zawiera aplikację do hostowania; na iPhonie aplikację instaluje się z adresu HTTPS, a nie otwierając HTML z ZIP.

**Aktualizacje na ekranie głównym:** otwarcie ikony z ekranu głównego zwykle tylko wznawia wcześniej zamrożoną kartę, a nie ładuje ją od nowa — aplikacja teraz sama sprawdza, czy jest nowa wersja, za każdym razem, gdy wraca na pierwszy plan (nie tylko przy pełnym przeładowaniu), więc pasek „Dostępna nowa wersja” powinien pojawić się przy najbliższym powrocie do aplikacji z internetem. Jeśli mimo to go nie widać, w pełni zamknij aplikację (przeciągnij w górę w przełączniku aplikacji) i otwórz ją ponownie, albo raz otwórz ten sam adres w zwykłej karcie Safari.

## Excel

Importer rozpoznaje nagłówki, niezależnie od ich kolejności. Obsługuje XLSX, XLS i CSV do 10 MB. Wczytuje arkusze z kolumną `Nazwa PM`, `Paczkomat`, `Kod paczkomatu`, `Nazwa lokalizacji` lub `Adres`.

- `Data` oznacza tydzień realizacji, a nie sztywny dzień wykonania.
- `Ekipy`, `Miasto`, `Kod pocztowy`, `Zaplanowane prace`, `Podłoże`, `Uwagi Global`, `Komentarz GPBS`, `Zgłoszenie`, `Miejsce` i telefony są zachowane.
- Szczegóły wizyty pokazują wszystkie niepuste nazwane kolumny źródłowe.
- Dwie różne prace przy tym samym punkcie są dwoma zleceniami i mogą być jedną wizytą (jeden dojazd).
- Uwagi „nie jechać bez potwierdzenia” wymagają zaznaczenia potwierdzenia w szczegółach. Oryginalny tekst pozostaje widoczny.
- Ponowny import tego samego pliku nie dubluje zleceń. Zachowuje status i przypisany dzień. Identyfikacja wykorzystuje tydzień, ekipę, punkt i identyfikator zgłoszenia lub miejsca oraz typ pracy. Bez identyfikatora zgłoszenia istotnie zmieniony opis może zostać rozpoznany jako nowe zadanie — sprawdź podsumowanie importu.
- Każdy wczytany plik zostaje w liście „Ostatnie importy” z przyciskiem usunięcia — kasuje wszystkie zlecenia z tego konkretnego importu (i lokalizacje, których nic już nie używa), po potwierdzeniu. Zlecenia z innych importów zostają nietknięte.

## Planowanie

Nie ma automatycznego układania całego tygodnia ani szacowania czasu pracy — kolejność i podział na dni ustalasz sam. Tydzień to pięć dni roboczych (Pon–Pt).

**Nagłówek i dni.** Na górze jest przełącznik tygodnia (strzałki i zakres dat; kliknięcie w daty otwiera kalendarz), nazwa ekipy i przycisk „Przekaż plan”. Pod nim pięć kafelków dni: kolorowy pasek dnia, liczba przystanków pozostałych do zrobienia i łączny czas jazdy (albo ile już zrobiono), ikona księżyca przy dniu z noclegiem, duży ptaszek i „gotowe”, gdy wszystko zrobione.

**Pasek dnia** jest przypięty u góry ekranu także podczas przewijania listy. Symbolami pokazuje, ile przystanków zostało do zrobienia, łączny czas w drodze, dystans, powrót do bazy (wyróżniony, gdy trwa godzinę lub dłużej) i ile wykonano. Obok są: przeliczenie odległości (żółte, gdy trzeba je policzyć), **Prowadź całą trasę w Google Maps** (pozostałe, niewykonane przystanki po kolei, od miejsca, w którym jest telefon; Google przyjmuje do 9 punktów pośrednich, w przeglądarce na telefonie tylko 3 — aplikacja Google Maps obsługuje 9), wyczyszczenie dnia i **Optymalizuj**, które układa pozostałe do zrobienia przystanki w najkrótszą kolejność (od 2 przystanków).

**Trasa jako oś czasu.** Start z bazy (albo z noclegu dnia poprzedniego) → czas dojazdu → przystanek → … → „Następny przystanek” → czas powrotu → powrót do bazy albo nocleg. Przystanek to jeden zwarty wiersz: numer w kolorze dnia, nazwa i adres, drobne znaczniki (rodzaj pracy, liczba zadań, notatka, ostrzeżenia), zielony przycisk z ptaszkiem „zrobione” i okrągła strzałka nawigacji do tego jednego punktu. Stuknięcie w nazwę albo w „⋯” rozwija akcje: Szczegóły, Miejsce pracy, Notatka, Inny dzień, wyżej/niżej i usunięcie z dnia. Na komputerze kolejność zmienisz też przeciąganiem.

**Zrobione.** Zielony przycisk z ptaszkiem przy przystanku oznacza go jako zrobiony jednym stuknięciem (wszystkie zlecenia w tym punkcie naraz). Zrobiony przystanek wypada z bieżącej trasy: zwija się do jednego zielonego wiersza „Zrobione 2/5” na górze osi czasu (po stuknięciu rozwija się lista przekreślonych punktów z godziną wykonania i przyciskiem „Cofnij”), znika z propozycji, z ostrzeżeń i z mapy innych dni, a na mapie swojego dnia ma zielony znacznik z ptaszkiem zamiast numeru. Kafelek dnia i pasek dnia liczą to, co zostało do zrobienia; gdy wszystko zrobione — ptaszek i „gotowe”. „Optymalizuj” układa już tylko pozostałe przystanki, licząc od ostatnio zrobionego (tam jest teraz ekipa), a zrobione zostają na początku w kolejności wykonania. W zakładce Zlecenia wykonane są przekreślone i na końcu listy.

**Następny przystanek** — propozycje wstawione wprost w oś czasu, posortowane według dojazdu od ostatniego przystanku (albo od bazy lub noclegu, gdy dzień jest pusty). Najbliższa ma zielony czas i żółty przycisk „+”; przy każdej widać też powrót do bazy, gdyby była ostatnia. Od razu widać pięć propozycji, resztę pod „Pokaż więcej”. Zlecenia bez lokalizacji albo czekające na potwierdzenie mają nieaktywny „+” i żółty znacznik, który od razu otwiera to, co trzeba uzupełnić.

**Ostrzeżenie o bliskich punktach** (czerwony znacznik, poniżej 20 minut jazdy): przy przystanku z trasy — gdy obok leży punkt jeszcze niezaplanowany na ten dzień (warto go dołożyć); przy propozycji — gdy leży blisko któregoś przystanku z trasy. Porównywanie „wszystkiego ze wszystkim” oznaczało na gęstym Śląsku prawie każdy punkt, więc znacznik pojawia się tylko tam, gdzie coś z tego wynika. Wymaga policzonych odległości.

**Mapa** pokazuje wszystkie punkty tygodnia: ponumerowane w kolorze dnia to trasa, „+” to wolne punkty, skrót dnia (np. „Wt”) to punkty zaplanowane na inny dzień. Kliknięcie „+” dodaje punkt jako następny przystanek, kliknięcie punktu z innego dnia przenosi go tutaj, a kliknięcie przystanku rozwija go na liście. Na pasku mapy: pokaż całość, odśwież przebieg trasy, składy kruszywa po drodze. Na telefonie i tablecie lista i mapa są przełączane („Lista | Mapa”) zamiast piętrzyć się jedna pod drugą.

Aplikacja nie zastępuje nieznanego dojazdu zerem ani trasą w linii prostej. Przy wielu ekipach wybierz jedną ekipę. Czasy są szacunkiem darmowego OSRM bez bieżących korków, do 70 lokalizacji naraz; Google Maps wyznacza bieżący dojazd osobno podczas nawigacji. Profil to jazda samochodem; ograniczenia ciężarówek nie są modelowane.

## Nocleg w trasie

Na końcu osi czasu, w wierszu „Powrót do bazy”, jest przycisk z księżycem **Nocleg**. Po zaznaczeniu dzień kończy się przy ostatnim przystanku (bez powrotu do bazy), pojawia się odnośnik do wyszukiwania noclegu na Booking.com dla tej lokalizacji, a **kolejny dzień** startuje stamtąd — propozycje „Następny przystanek” i czas dojazdu do pierwszego przystanku liczą się od miejsca noclegu, a jego oś czasu zaczyna się od „Start z noclegu”. Kafelek dnia z noclegiem ma ikonę księżyca. Działa to w obrębie jednego tygodnia — poniedziałek zawsze startuje z bazy. Cofnięcie: przycisk „Powrót” w tym samym wierszu.

Booking.com to zwykły odnośnik wyszukiwania (adres/miejscowość jako fraza) — bez konta, klucza czy prowizji wbudowanej w aplikację.

## Składy kruszywa i kamienia

Przy szczegółach zlecenia jest przycisk „Składy kruszywa w pobliżu” (szuka w promieniu ok. 8 km od tego punktu), a na pasku mapy dnia — ikona góry „Składy kruszywa po drodze” (szuka w prostokącie obejmującym bazę i wszystkie przystanki tego dnia). Obie opcje najpierw dają gotowy odnośnik do wyszukiwania w Google Maps, a poniżej doładowują listę konkretnych obiektów z OpenStreetMap (kopalnie, składy materiałów budowlanych) z odległością i odnośnikiem do nawigacji. Wyszukiwanie OSM czasem odpowiada wolno albo z błędem 504 — to przeciążenie darmowego serwera Overpass, nie awaria aplikacji; odnośnik do Google Maps działa zawsze.

## Zobacz miejsce pracy

Przy każdym przystanku i w szczegółach zlecenia jest przycisk „Zobacz miejsce pracy”: mapa danego punktu z wyborem podkładu i nakładek. Całość jest zwarta — mapa jest widoczna od razu, tuż pod jednym rzędem podkładów, zamiast dopiero po długim przewijaniu w dół.

**Mapa bazowa** — jeden wiersz nad samą mapą, pięć podkładów do wyboru (dokładnie jeden naraz), każdy jako mała miniaturka będąca prawdziwym wycinkiem tego podkładu w tym miejscu, nie generyczną ikoną (pełny opis każdego podkładu jest w podpowiedzi po najechaniu):
- **Ulice** — OpenStreetMap (domyślny).
- **Esri** — satelita, Esri World Imagery, publiczny serwis, zwykle szybciej odpowiada niż GUGiK.
- **GUGiK** — satelita, ortofotomapa Głównego Urzędu Geodezji i Kartografii (usługa WMS ORTO), często bardziej aktualna dla Polski niż globalne serwisy.
- **Hybryda** i **Google** — kafelki satelitarne+opisy oraz zwykła mapa Google, pobierane z nieoficjalnego, ogólnodostępnego adresu `mtN.google.com/vt` (bez klucza API). Wygodne przy dwóch osobach, ale nieoficjalne — Google może to zmienić lub zablokować bez zapowiedzi; jeśli przestanie działać, użyj innego podkładu.

Obok tego wiersza jest pomarańczowy okrągły przycisk Street View (ikona ludzika) — link do panoramy Google Maps w tym punkcie.

**Działki i sieci uzbrojenia terenu** — jeden przewijany w poziomie rząd „chipów” pod mapą: „Działki” plus dziewięć rodzajów sieci GESUT (wodociągowa, kanalizacyjna, elektroenergetyczna, gazowa, ciepłownicza, telekomunikacyjna, specjalna, niezidentyfikowana, urządzenia), zamiast osobnego przełącznika i osobnej siatki checkboxów zajmujących kilka wierszy. Włączenie „Działki” zmienia kursor na mapie, żeby było widać, że można kliknąć — kliknięcie podświetla na żółto działkę pod tym punktem i pokazuje jej numer ewidencyjny w dymku, przez usługę ULDK (GUGiK). Zaznaczone sieci GESUT (z krajowej usługi integracyjnej KIUT, też GUGiK) są pobierane jednym zapytaniem WMS niezależnie od tego, ile naraz jest włączonych, więc nie zalewają przeglądarki równoległymi żądaniami i nie zakłócają wczytywania mapy bazowej. Obie nakładki są widoczne dopiero przy bardzo dużym przybliżeniu (blisko adresu, nie widoku miasta) i mogą nie obejmować wszystkich powiatów — dane GESUT pochodzą od 385 różnych podmiotów prowadzących rejestr.

Wszystkie te usługi są bezpłatne i nie wymagają konta ani klucza; podkłady Google są dodatkowo nieoficjalne (patrz wyżej).

## Notatki przy punkcie

Zamiast przycisku „Start” każdy przystanek ma przycisk „Dodaj notatkę”. Notatka jest przypisana do lokalizacji (nie do konkretnego zlecenia) i pokazuje się od razu na karcie przystanku oraz w liście podpowiedzi kolejnego przystanku — przydatne np. na „brama zamknięta, dzwonić na domofon 12”. Status wykonania (w trakcie / wykonano) nadal ustawia się w „Szczegółach” zlecenia.

## Zapis i przekazywanie

Zlecenia, ustawienia, plan i pobrane wyniki tras są w IndexedDB na danym urządzeniu. Przyciskiem „Przekaż plan” wyślij JSON przez systemowe udostępnianie iOS lub pobierz plik. Kolega wybiera „Wczytaj plan od kolegi”. Wczytanie kopii zastępuje lokalny plan po potwierdzeniu; nie jest synchronizacją w czasie rzeczywistym.

Kopia może zawierać dane kontaktowe i opisy prac. Udostępniaj ją osobom pracującym przy tych zleceniach. Źródłowy Excel i kontakty nie są w tym repozytorium. Aplikacja wysyła do zewnętrznych usług wyłącznie kody paczkomatów, adresy i współrzędne potrzebne do map i trasowania.

Offline: interfejs, lista, opisy, statusy i zapisane wyniki pozostają dostępne po pierwszym prawidłowym otwarciu. Nowe obliczenia i pobieranie map wymagają internetu. Podkłady map nie są pobierane hurtowo do pracy offline. Usunięcie danych witryny usuwa zapis z telefonu. Rób kopie JSON.

## Usługi

Wszystko poniżej jest bezpłatne i nie wymaga klucza ani konta:
- Lokalizacje: publiczny endpoint InPost Points bez tokena, gdy dostępny; zapasowo wyszukiwanie adresu w Nominatim z zatwierdzeniem wyniku. Endpoint InPost może zmienić zasady dostępu; pozostają adres i ręczna pinezka.
- Trasy i macierz: publiczny serwer demonstracyjny OSRM. Bez klucza i opłat, ale bez gwarancji dostępności.
- Podkłady mapy „Zobacz miejsce pracy”: OpenStreetMap, Esri World Imagery, ortofotomapa, działki ewidencyjne (EGiB) i sieci uzbrojenia terenu (GESUT/KIUT) z usług WMS Głównego Urzędu Geodezji i Kartografii — wszystkie publiczne, bez klucza.
- Numer działki po kliknięciu: usługa ULDK (uldk.gugik.gov.pl), również GUGiK, publiczna i bez klucza.
- Nawigacja i Street View: zwykłe odnośniki Google Maps, bez Google Maps Platform API i bez konta rozliczeniowego.
- Booking.com: zwykły odnośnik wyszukiwania, bez konta i klucza.
- Składy kruszywa: publiczny Overpass API (OpenStreetMap), plus odnośnik wyszukiwania w Google Maps.

Bezpłatne, ale nieoficjalne (Google może zmienić lub zablokować bez zapowiedzi):
- Podkłady „Google” i „Google hybryda” w „Zobacz miejsce pracy”: publicznie dostępne kafelki `mtN.google.com/vt`, bez klucza API, ale poza oficjalnym wsparciem Google Maps Platform.

Zapytania aplikacji do usług objętych kolejką (InPost, Nominatim, OSRM, Overpass) są rozdzielone odstępem co najmniej 1,2 s. Lokalizacje i macierz OSRM są ponownie używane. Nie ma geokodowania przy każdym wpisanym znaku ani wstępnego pobierania kafelków.

## Uruchomienie i publikacja

Wymagany Node.js 22+ tylko do lokalnego serwera i testów. Aplikacja nie wymaga kompilacji ani npm install.

```text
npm test
npm start
```

Strona lokalna: `http://127.0.0.1:4173/`. Service worker działa na localhost lub HTTPS. Otwarcie pliku z dysku nie zastępuje hostingu.

Repozytorium zawiera workflow GitHub Pages. W Settings → Pages wybierz GitHub Actions. Każda zmiana gałęzi main uruchomi testy, zapisze zawartość `dist/` i opublikuje ją. Alternatywnie skopiuj zawartość `dist/` na dowolny hosting statyczny HTTPS, również pod podkatalogiem. Wszystkie lokalne ścieżki są względne.

## Sprawdzenia

`node --test tests/*.test.mjs` sprawdza importer, usuwanie importu (kasuje tylko swoje zlecenia i nieużywane już lokalizacje), daty, duplikaty, ranking kandydatów wg dojazdu, podsumowanie trasy dnia (w tym nocleg jako inny punkt startu), optymalizację kolejności (dokładny algorytm zgadza się z przeglądem zupełnym, honoruje nietypowy punkt startu, nigdy nie zmyśla trasy tam, gdzie jej brak), link do całej trasy w Google Maps (kolejność, limit 9 punktów pośrednich, start z bieżącej lokalizacji telefonu), parsowanie geometrii działki z ULDK, adresy URL (Google Maps/wyszukiwanie/Street View/Booking.com) i kopie danych. Testy pakietu pilnują, że tylko darmowy OSRM liczy trasy (bez klucza Google), że nie ma modułu auto-rozkładu, że dzień to jedna oś czasu z propozycjami następnego przystanku i zwiniętymi akcjami, że „Optymalizuj” jest w przypiętym pasku dnia, że telefon i tablet przełączają listę i mapę, że każdy przycisk-symbol ma etykietę dla czytnika ekranu, że zrobione przystanki wypadają z bieżącej trasy, propozycji, mapy i optymalizacji, że propozycji widać najpierw pięć, że ostrzeżenie o bliskich punktach działa do 20 minut, że dni to Pon–Pt (a przystanki pozostałe po sobocie i niedzieli wracają do puli) oraz że okno „Zobacz miejsce pracy” ma podkłady nad mapą i jeden rząd chipów dla działek i GESUT. Opcjonalny test rzeczywistego Excela korzysta ze zmiennej `T38_EXCEL`; plik źródłowy nie jest częścią repozytorium. Żadne testy nie składają zleceń, nie wysyłają wiadomości ani nie wołają zewnętrznych usług na żywo.

## Biblioteki i dane

Leaflet 1.9.4 (BSD-2-Clause), SheetJS CE 0.20.3 (Apache-2.0). Kopie bibliotek są dołączone lokalnie, aby podstawowy interfejs i odczyt Excela działały po utracie połączenia. Szczegóły źródeł w DATA_SOURCES.md, licencje w dist/vendor/.
