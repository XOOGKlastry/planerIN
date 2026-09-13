# PaczkoPlan

Bezpłatna aplikacja PWA dla ekipy montującej i serwisującej paczkomaty. Działa na iPhonie, Androidzie i komputerze. Nawigacja wyłącznie w Google Maps. Bez kont, płatnych kluczy, abonamentów i ustawiania przerw.

## Pierwsze uruchomienie

1. Otwórz opublikowaną stronę w Safari na iPhonie.
2. Udostępnij → Do ekranu początkowego → Otwórz jako aplikację www → Dodaj.
3. Uruchom ikonę PaczkoPlan. Wczytaj Excel z aplikacji Pliki.
4. W Ustawieniach wybierz miejsce startu/powrotu i dni pracy (domyślnie poniedziałek–piątek).
5. Naciśnij „Policz odległości”. Na każdy dzień sam wybierz pierwszy przystanek, a potem kolejne z podpowiadanej listy „co jest po drodze”.

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

Nie ma automatycznego układania całego tygodnia ani szacowania czasu pracy — to Ty decydujesz o kolejności i podziale na dni. Dla wybranego dnia aplikacja pokazuje pozostałe zlecenia posortowane według czasu dojazdu od ostatnio dodanego przystanku (lub od bazy, jeśli dzień jest jeszcze pusty) — najbliższy jest oznaczony „Najbliżej”. Wybierasz, klikając „Dodaj”; podpowiedź to sugestia, nie wymóg.

Przy każdym kandydacie widać też czas powrotu do bazy, gdyby to on był ostatnim przystankiem tego dnia — pozwala to uniknąć sytuacji, w której dzień kończy się daleko od bazy z długim powrotem. Podsumowanie dnia pokazuje łączny czas jazdy między przystankami i czas powrotu z ostatniego punktu; powrót dłuższy niż godzinę jest wyróżniony.

Kolejność w dniu można zmienić przeciąganiem (komputer) albo przyciskami góra/dół (telefon). „Zmień dzień” przenosi wizytę na inny dzień, „Usuń” zwraca ją do puli nieprzypisanych. Zlecenia bez współrzędnych lub niepotwierdzone (uwaga „nie jechać bez potwierdzenia”) nie mają aktywnego przycisku „Dodaj”, dopóki nie zostaną uzupełnione. Aplikacja nie zastępuje nieznanego dojazdu zerem ani fikcyjną trasą w linii prostej. Do jednego przeliczenia odległości obsługiwanych jest do 70 lokalizacji. Przy wielu ekipach wybierz jedną ekipę.

Czasy są szacunkiem OSRM bez bieżących korków. Google Maps wyznacza bieżący dojazd osobno podczas nawigacji i nie zwraca swojego ETA do aplikacji. Używany profil to jazda samochodem; ograniczenia ciężarówek nie są modelowane.

## Zapis i przekazywanie

Zlecenia, ustawienia, plan i pobrane wyniki tras są w IndexedDB na danym urządzeniu. Przyciskiem „Przekaż plan” wyślij JSON przez systemowe udostępnianie iOS lub pobierz plik. Kolega wybiera „Wczytaj plan od kolegi”. Wczytanie kopii zastępuje lokalny plan po potwierdzeniu; nie jest synchronizacją w czasie rzeczywistym.

Kopia może zawierać dane kontaktowe i opisy prac. Udostępniaj ją osobom pracującym przy tych zleceniach. Źródłowy Excel i kontakty nie są w tym repozytorium. Aplikacja wysyła do zewnętrznych usług wyłącznie kody paczkomatów, adresy i współrzędne potrzebne do map i trasowania.

Offline: interfejs, lista, opisy, statusy i zapisane wyniki pozostają dostępne po pierwszym prawidłowym otwarciu. Nowe obliczenia i pobieranie map wymagają internetu. Podkłady map nie są pobierane hurtowo do pracy offline. Usunięcie danych witryny usuwa zapis z telefonu. Rób kopie JSON.

## Bezpłatne usługi

- Lokalizacje: publiczny endpoint InPost Points bez tokena, gdy dostępny; zapasowo wyszukiwanie adresu w Nominatim z zatwierdzeniem wyniku. Endpoint InPost może zmienić zasady dostępu; pozostają adres i ręczna pinezka.
- Trasy i macierz: publiczny serwer demonstracyjny OSRM. Bez klucza i opłat, ale bez gwarancji dostępności.
- Podkład mapy: OpenStreetMap, z widocznym oznaczeniem źródła.
- Nawigacja: zwykłe odnośniki Google Maps, bez Google Routes API i bez konta rozliczeniowego.

Zapytania aplikacji są kolejkowane z odstępem co najmniej 1,2 s. Lokalizacje i macierz są ponownie używane. Nie ma geokodowania przy każdym wpisanym znaku ani wstępnego pobierania kafelków.

## Uruchomienie i publikacja

Wymagany Node.js 22+ tylko do lokalnego serwera i testów. Aplikacja nie wymaga kompilacji ani npm install.

```text
npm test
npm start
```

Strona lokalna: `http://127.0.0.1:4173/`. Service worker działa na localhost lub HTTPS. Otwarcie pliku z dysku nie zastępuje hostingu.

Repozytorium zawiera workflow GitHub Pages. W Settings → Pages wybierz GitHub Actions. Każda zmiana gałęzi main uruchomi testy, zapisze zawartość `dist/` i opublikuje ją. Alternatywnie skopiuj zawartość `dist/` na dowolny hosting statyczny HTTPS, również pod podkatalogiem. Wszystkie lokalne ścieżki są względne.

## Sprawdzenia

`node --test tests/*.test.mjs` sprawdza importer, daty, duplikaty, ranking kandydatów wg dojazdu, podsumowanie trasy dnia i kopie danych. Opcjonalny test rzeczywistego Excela korzysta ze zmiennej `T38_EXCEL`; plik źródłowy nie jest częścią repozytorium. Żadne testy nie składają zleceń ani nie wysyłają wiadomości.

## Biblioteki i dane

Leaflet 1.9.4 (BSD-2-Clause), SheetJS CE 0.20.3 (Apache-2.0). Kopie bibliotek są dołączone lokalnie, aby podstawowy interfejs i odczyt Excela działały po utracie połączenia. Szczegóły źródeł w DATA_SOURCES.md, licencje w dist/vendor/.
