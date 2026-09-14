# PaczkoPlan

Aplikacja PWA dla ekipy montującej i serwisującej paczkomaty. Działa na iPhonie, Androidzie i komputerze. Nawigacja wyłącznie w Google Maps. Bez kont i bez ustawiania przerw. Domyślnie w pełni bezpłatna (OSRM); Google Distance Matrix jest opcją, którą włączasz sam swoim kluczem.

## Pierwsze uruchomienie

1. Otwórz opublikowaną stronę w Safari na iPhonie.
2. Udostępnij → Do ekranu początkowego → Otwórz jako aplikację www → Dodaj.
3. Uruchom ikonę PaczkoPlan. Wczytaj Excel z aplikacji Pliki.
4. W Ustawieniach wybierz miejsce startu/powrotu. Tydzień pokazuje wszystkie 7 dni — nie ma wyboru „dni roboczych”.
5. Naciśnij „Policz odległości”. Na każdy dzień sam wybierz pierwszy przystanek, a potem kolejne z podpowiadanej listy „co jest po drodze”, albo naciśnij „Zaproponuj rozkład”, żeby od razu rozłożyć resztę zleceń na dni (nadal możesz to poprawić ręcznie).

Safari i PWA mogą mieć oddzielny zapis. Jeśli zaczynasz w Safari, zapisz kopię planu i wczytaj ją po instalacji. Plik ZIP zawiera aplikację do hostowania; na iPhonie aplikację instaluje się z adresu HTTPS, a nie otwierając HTML z ZIP.

## Excel

Importer rozpoznaje nagłówki, niezależnie od ich kolejności. Obsługuje XLSX, XLS i CSV do 10 MB. Wczytuje arkusze z kolumną `Nazwa PM`, `Paczkomat`, `Kod paczkomatu`, `Nazwa lokalizacji` lub `Adres`.

- `Data` oznacza tydzień realizacji, a nie sztywny dzień wykonania.
- `Ekipy`, `Miasto`, `Kod pocztowy`, `Zaplanowane prace`, `Podłoże`, `Uwagi Global`, `Komentarz GPBS`, `Zgłoszenie`, `Miejsce` i telefony są zachowane.
- Szczegóły wizyty pokazują wszystkie niepuste nazwane kolumny źródłowe.
- Dwie różne prace przy tym samym punkcie są dwoma zleceniami i mogą być jedną wizytą (jeden dojazd).
- Uwagi „nie jechać bez potwierdzenia” wymagają zaznaczenia potwierdzenia w szczegółach. Oryginalny tekst pozostaje widoczny.
- Ponowny import tego samego pliku nie dubluje zleceń. Zachowuje status i przypisany dzień. Identyfikacja wykorzystuje tydzień, ekipę, punkt i identyfikator zgłoszenia lub miejsca oraz typ pracy. Bez identyfikatora zgłoszenia istotnie zmieniony opis może zostać rozpoznany jako nowe zadanie — sprawdź podsumowanie importu.

## Planowanie

Nie ma automatycznego układania całego tygodnia ani szacowania czasu pracy — to Ty decydujesz o kolejności i podziale na dni. Tydzień to zawsze 7 dni (Pon–Nie); nie ma osobnego wyboru dni roboczych. Dla wybranego dnia aplikacja pokazuje pozostałe zlecenia posortowane według czasu dojazdu od ostatnio dodanego przystanku (lub od bazy / miejsca noclegu, jeśli dzień jest jeszcze pusty) — najbliższy jest oznaczony „Najbliżej”. Wybierasz, klikając „Dodaj”; podpowiedź to sugestia, nie wymóg.

„Zaproponuj rozkład” to jednorazowa propozycja: dokłada pozostałe, nieprzypisane zlecenia do dni najbliższym-sąsiadem (licząc od ostatniego punktu danego dnia lub od bazy), zaczynając nowy dzień po ok. 6 przystankach lub 3 godzinach jazdy. Nigdy nie rusza tego, co już ręcznie ułożyłeś — tylko uzupełnia puste miejsca. Traktuj to jako punkt startowy do poprawienia, nie ostateczny plan.

Przy każdym kandydacie widać też czas powrotu do bazy, gdyby to on był ostatnim przystankiem tego dnia — pozwala to uniknąć sytuacji, w której dzień kończy się daleko od bazy z długim powrotem. Podsumowanie dnia pokazuje łączny czas jazdy między przystankami i czas powrotu z ostatniego punktu; powrót dłuższy niż godzinę jest wyróżniony.

Kolejność w dniu można zmienić przeciąganiem (komputer) albo przyciskami góra/dół (telefon). „Zmień dzień” przenosi wizytę na inny dzień, „Usuń” zwraca ją do puli nieprzypisanych. Zlecenia bez współrzędnych lub niepotwierdzone (uwaga „nie jechać bez potwierdzenia”) nie mają aktywnego przycisku „Dodaj”, dopóki nie zostaną uzupełnione. Aplikacja nie zastępuje nieznanego dojazdu zerem ani fikcyjną trasą w linii prostej. Przy wielu ekipach wybierz jedną ekipę.

Domyślnie czasy są szacunkiem darmowego OSRM bez bieżących korków, do 70 lokalizacji naraz. Google Maps wyznacza bieżący dojazd osobno podczas nawigacji i nie zwraca swojego ETA do aplikacji. Używany profil to jazda samochodem; ograniczenia ciężarówek nie są modelowane.

## Nocleg w trasie

Przy ostatnim przystanku dnia jest przycisk „Nocleg tutaj zamiast powrotu”. Po zaznaczeniu: dzień kończy się w tym miejscu (nie liczy powrotu do bazy), pojawia się odnośnik do wyszukiwania noclegu na Booking.com dla tej lokalizacji, a **kolejny dzień** wystartuje stamtąd — podpowiedzi „co po drodze” i czas dojazdu do pierwszego przystanku liczą się już od miejsca noclegu, nie od bazy. Dzień po dniu z noclegiem pokazuje w kafelku „Z noclegu”, żeby było jasne, skąd się zaczyna. To działa tylko w obrębie jednego tygodnia — poniedziałek zawsze startuje z bazy, nawet jeśli niedziela poprzedniego tygodnia kończyła się noclegiem. Cofnięcie: przycisk „Jednak wracamy do bazy tego dnia” przy tym samym przystanku.

Booking.com to zwykły odnośnik wyszukiwania (adres/miejscowość jako fraza) — bez konta, klucza czy prowizji wbudowanej w aplikację.

## Składy kruszywa i kamienia

Przy szczegółach zlecenia jest przycisk „Składy kruszywa w pobliżu” (szuka w promieniu ok. 8 km od tego punktu), a przy mapie dnia — „Znajdź składy po drodze” (szuka w prostokącie obejmującym bazę i wszystkie przystanki tego dnia). Obie opcje najpierw dają gotowy odnośnik do wyszukiwania w Google Maps, a poniżej doładowują listę konkretnych obiektów z OpenStreetMap (kopalnie, składy materiałów budowlanych) z odległością i odnośnikiem do nawigacji. Wyszukiwanie OSM czasem odpowiada wolno albo z błędem 504 — to przeciążenie darmowego serwera Overpass, nie awaria aplikacji; odnośnik do Google Maps działa zawsze.

## Google Distance Matrix (opcjonalnie, płatne)

W Ustawieniach można wpisać własny klucz Google Maps API. Wtedy „Policz odległości” pyta Google Distance Matrix zamiast darmowego OSRM — dokładniejsze, ale **płatne powyżej darmowego limitu Twojego konta Google Cloud**. Zanim wpiszesz klucz:

- Załóż projekt w Google Cloud Console, włącz Distance Matrix API (i Maps JavaScript API, z którego korzysta w przeglądarce) i podepnij kartę.
- Ogranicz klucz do własnej domeny (HTTP referrer: `https://xoogklastry.github.io/*`), żeby nikt inny go nie wykorzystał, nawet gdyby go podejrzał.
- Ustaw **budżet i alert** w sekcji Billing — to jedyny realny „kaganiec” na wydatki; aplikacja tylko pokazuje przed każdym zapytaniem, ile par lokalizacji sprawdzi (n×n), i wymaga potwierdzenia.
- Tryb Google obsługuje do 25 lokalizacji naraz (razem z bazą) — to limit tego zapytania w Google. Więcej punktów: podziel na ekipy/tygodnie albo użyj darmowego OSRM.

Klucz zapisuje się tylko na tym telefonie (w ustawieniach, nie w repozytorium) i **nigdy nie jest dołączany do „Przekaż plan”** — udostępniona kopia planu nie przenosi Twojego klucza (i Twoich opłat) na telefon kolegi. Każdy, kto chce liczyć przez Google, wpisuje własny klucz.

## Zapis i przekazywanie

Zlecenia, ustawienia, plan i pobrane wyniki tras są w IndexedDB na danym urządzeniu. Przyciskiem „Przekaż plan” wyślij JSON przez systemowe udostępnianie iOS lub pobierz plik. Kolega wybiera „Wczytaj plan od kolegi”. Wczytanie kopii zastępuje lokalny plan po potwierdzeniu; nie jest synchronizacją w czasie rzeczywistym.

Kopia może zawierać dane kontaktowe i opisy prac. Udostępniaj ją osobom pracującym przy tych zleceniach. Źródłowy Excel i kontakty nie są w tym repozytorium. Aplikacja wysyła do zewnętrznych usług wyłącznie kody paczkomatów, adresy i współrzędne potrzebne do map i trasowania.

Offline: interfejs, lista, opisy, statusy i zapisane wyniki pozostają dostępne po pierwszym prawidłowym otwarciu. Nowe obliczenia i pobieranie map wymagają internetu. Podkłady map nie są pobierane hurtowo do pracy offline. Usunięcie danych witryny usuwa zapis z telefonu. Rób kopie JSON.

## Usługi

Bezpłatne, bez klucza:
- Lokalizacje: publiczny endpoint InPost Points bez tokena, gdy dostępny; zapasowo wyszukiwanie adresu w Nominatim z zatwierdzeniem wyniku. Endpoint InPost może zmienić zasady dostępu; pozostają adres i ręczna pinezka.
- Trasy i macierz (domyślnie): publiczny serwer demonstracyjny OSRM. Bez klucza i opłat, ale bez gwarancji dostępności.
- Podkład mapy: OpenStreetMap, z widocznym oznaczeniem źródła.
- Nawigacja: zwykłe odnośniki Google Maps, bez Google Routes API i bez konta rozliczeniowego.
- Booking.com: zwykły odnośnik wyszukiwania, bez konta i klucza.
- Składy kruszywa: publiczny Overpass API (OpenStreetMap), plus odnośnik wyszukiwania w Google Maps.

Opcjonalne, wymaga własnego klucza i konta rozliczeniowego:
- Trasy i macierz (jeśli wpiszesz klucz w Ustawieniach): Google Distance Matrix. Szczegóły i ostrzeżenia o kosztach wyżej.

Zapytania aplikacji do darmowych usług są kolejkowane z odstępem co najmniej 1,2 s. Lokalizacje i macierz są ponownie używane. Nie ma geokodowania przy każdym wpisanym znaku ani wstępnego pobierania kafelków.

## Uruchomienie i publikacja

Wymagany Node.js 22+ tylko do lokalnego serwera i testów. Aplikacja nie wymaga kompilacji ani npm install.

```text
npm test
npm start
```

Strona lokalna: `http://127.0.0.1:4173/`. Service worker działa na localhost lub HTTPS. Otwarcie pliku z dysku nie zastępuje hostingu.

Repozytorium zawiera workflow GitHub Pages. W Settings → Pages wybierz GitHub Actions. Każda zmiana gałęzi main uruchomi testy, zapisze zawartość `dist/` i opublikuje ją. Alternatywnie skopiuj zawartość `dist/` na dowolny hosting statyczny HTTPS, również pod podkatalogiem. Wszystkie lokalne ścieżki są względne.

## Sprawdzenia

`node --test tests/*.test.mjs` sprawdza importer, daty, duplikaty, ranking kandydatów wg dojazdu, podsumowanie trasy dnia (w tym nocleg jako inny punkt startu), auto-rozkład, adresy URL (Google Maps/wyszukiwanie/Booking.com) i kopie danych — w tym że plik od kolegi nie może zawierać cudzego klucza Google. Opcjonalny test rzeczywistego Excela korzysta ze zmiennej `T38_EXCEL`; plik źródłowy nie jest częścią repozytorium. Żadne testy nie składają zleceń, nie wysyłają wiadomości ani nie wołają Google/Overpass na żywo.

## Biblioteki i dane

Leaflet 1.9.4 (BSD-2-Clause), SheetJS CE 0.20.3 (Apache-2.0). Kopie bibliotek są dołączone lokalnie, aby podstawowy interfejs i odczyt Excela działały po utracie połączenia. Szczegóły źródeł w DATA_SOURCES.md, licencje w dist/vendor/.
