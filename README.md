# PaczkoPlan

Aplikacja PWA dla ekipy montującej i serwisującej paczkomaty. Działa na iPhonie, Androidzie i komputerze. Nawigacja wyłącznie w Google Maps. W pełni bezpłatna — trasy liczy darmowy OSRM, bez kluczy i kont rozliczeniowych. Bez kont i bez ustawiania przerw.

## Pierwsze uruchomienie

1. Otwórz opublikowaną stronę w Safari na iPhonie.
2. Udostępnij → Do ekranu początkowego → Otwórz jako aplikację www → Dodaj.
3. Uruchom ikonę PaczkoPlan. Wczytaj Excel z aplikacji Pliki.
4. W Ustawieniach wybierz miejsce startu/powrotu. Tydzień pokazuje wszystkie 7 dni — nie ma wyboru „dni roboczych”.
5. Naciśnij „Policz odległości”. Na każdy dzień sam wybierz pierwszy przystanek — z podpowiadanej listy „co jest po drodze” albo bezpośrednio klikając pinezkę na mapie — a potem kolejne w takiej kolejności, w jakiej je dodajesz. Gdy wszystkie są już na dniu, naciśnij „Optymalizuj trasę” (zawsze widoczne na górze), żeby poprawić kolejność na najkrótszą.

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

Nie ma automatycznego układania całego tygodnia ani szacowania czasu pracy — to Ty decydujesz o kolejności i podziale na dni, w całości ręcznie. Tydzień to zawsze 7 dni (Pon–Nie); nie ma osobnego wyboru dni roboczych. Dla wybranego dnia aplikacja pokazuje pozostałe zlecenia posortowane według czasu dojazdu od ostatnio dodanego przystanku (lub od bazy / miejsca noclegu, jeśli dzień jest jeszcze pusty) — najbliższy jest oznaczony „Najbliżej”. Wybierasz, klikając „Dodaj” na liście.

**Mapa dnia pokazuje wszystkie punkty na raz** — te już dodane do dnia jako ponumerowane pinezki, a pozostałe jako pinezki z „+” (jeszcze nieprzypisane) albo ze skrótem innego dnia (już zaplanowane gdzie indziej — kliknięcie przenosi je tutaj). **Każdy dzień tygodnia ma swój kolor** — trasa i numery na mapie są w kolorze wybranego dnia, a te same kolory widać jako pasek przy kafelku dnia u góry, więc od razu wiadomo, do którego dnia należy dana pinezka. Kliknięcie pinezki dodaje ją jako kolejny przystanek — dokładnie to samo, co przycisk „Dodaj” na liście, tylko wprost na mapie. Kolejność, w jakiej klikasz, jest kolejnością trasy.

**Ostrzeżenie o bliskich punktach** — gdy dwa punkty w tygodniowej puli dzieli mniej niż 10 minut jazdy, oba dostają wyraźny czerwony znacznik z czasem i nazwą tego drugiego punktu (na liście dnia i na liście podpowiedzi). To zwykle sygnał, że warto je odwiedzić jednego dnia po kolei, albo że to w istocie ten sam adres wpisany dwa razy.

**„Optymalizuj trasę”** jest zawsze widoczne na górze ekranu (obok „Policz odległości”) — układa już dodane przystanki bieżącego dnia w najkrótszą trasę od bazy (lub miejsca noclegu) przez wszystkie z nich i z powrotem, dokładnym algorytmem dla typowej liczby przystanków dziennie. Nie dodaje ani nie usuwa niczego, tylko zmienia kolejność; aktywne dopiero od 2 przystanków.

Przy każdym kandydacie widać też czas powrotu do bazy, gdyby to on był ostatnim przystankiem tego dnia — pozwala to uniknąć sytuacji, w której dzień kończy się daleko od bazy z długim powrotem. Podsumowanie dnia pokazuje łączny czas jazdy między przystankami i czas powrotu z ostatniego punktu; powrót dłuższy niż godzinę jest wyróżniony.

Kolejność w dniu można też zmienić przeciąganiem (komputer) albo przyciskami góra/dół (telefon). **„Reset dnia”** usuwa wszystkie przystanki z bieżącego dnia naraz (po potwierdzeniu) — wracają do puli nieprzypisanych. „Zmień dzień” przenosi jedną wizytę na inny dzień, „Usuń” zwraca jedną wizytę do puli. Zlecenia bez współrzędnych lub niepotwierdzone (uwaga „nie jechać bez potwierdzenia”) nie mają aktywnego przycisku „Dodaj” ani nie da się ich dodać z mapy, dopóki nie zostaną uzupełnione. Aplikacja nie zastępuje nieznanego dojazdu zerem ani fikcyjną trasą w linii prostej. Przy wielu ekipach wybierz jedną ekipę.

Czasy są szacunkiem darmowego OSRM bez bieżących korków, do 70 lokalizacji naraz. Google Maps wyznacza bieżący dojazd osobno podczas nawigacji i nie zwraca swojego ETA do aplikacji. Używany profil to jazda samochodem; ograniczenia ciężarówek nie są modelowane.

## Nocleg w trasie

Przy ostatnim przystanku dnia jest przycisk „Nocleg tutaj zamiast powrotu”. Po zaznaczeniu: dzień kończy się w tym miejscu (nie liczy powrotu do bazy), pojawia się odnośnik do wyszukiwania noclegu na Booking.com dla tej lokalizacji, a **kolejny dzień** wystartuje stamtąd — podpowiedzi „co po drodze” i czas dojazdu do pierwszego przystanku liczą się już od miejsca noclegu, nie od bazy. Dzień po dniu z noclegiem pokazuje w kafelku „Z noclegu”, żeby było jasne, skąd się zaczyna. To działa tylko w obrębie jednego tygodnia — poniedziałek zawsze startuje z bazy, nawet jeśli niedziela poprzedniego tygodnia kończyła się noclegiem. Cofnięcie: przycisk „Jednak wracamy do bazy tego dnia” przy tym samym przystanku.

Booking.com to zwykły odnośnik wyszukiwania (adres/miejscowość jako fraza) — bez konta, klucza czy prowizji wbudowanej w aplikację.

## Składy kruszywa i kamienia

Przy szczegółach zlecenia jest przycisk „Składy kruszywa w pobliżu” (szuka w promieniu ok. 8 km od tego punktu), a przy mapie dnia — „Znajdź składy po drodze” (szuka w prostokącie obejmującym bazę i wszystkie przystanki tego dnia). Obie opcje najpierw dają gotowy odnośnik do wyszukiwania w Google Maps, a poniżej doładowują listę konkretnych obiektów z OpenStreetMap (kopalnie, składy materiałów budowlanych) z odległością i odnośnikiem do nawigacji. Wyszukiwanie OSM czasem odpowiada wolno albo z błędem 504 — to przeciążenie darmowego serwera Overpass, nie awaria aplikacji; odnośnik do Google Maps działa zawsze.

## Zobacz miejsce pracy

Przy każdym przystanku i w szczegółach zlecenia jest przycisk „Zobacz miejsce pracy”: mapa danego punktu z wyborem podkładu i nakładek.

**Mapa bazowa** — pasek nad samą mapą, pięć podkładów do wyboru (dokładnie jeden naraz), każdy jako miniaturka będąca prawdziwym wycinkiem tego podkładu w tym miejscu, nie generyczną ikoną:
- **Ulice** — OpenStreetMap (domyślny).
- **Satelita (szybsze)** — Esri World Imagery, publiczny serwis, zwykle szybciej odpowiada niż GUGiK.
- **Satelita (nowsze)** — ortofotomapa Głównego Urzędu Geodezji i Kartografii (usługa WMS ORTO), często bardziej aktualna dla Polski niż globalne serwisy.
- **Google hybryda** i **Google** — kafelki satelitarne+opisy oraz zwykła mapa Google, pobierane z nieoficjalnego, ogólnodostępnego adresu `mtN.google.com/vt` (bez klucza API). Wygodne przy dwóch osobach, ale nieoficjalne — Google może to zmienić lub zablokować bez zapowiedzi; jeśli przestanie działać, użyj innego podkładu.

**Działki ewidencyjne** — osobny przełącznik nad siecami uzbrojenia: włącza granice działek (usługa EGiB Głównego Urzędu Geodezji i Kartografii) i zmienia kursor na mapie, żeby było widać, że można kliknąć. Kliknięcie w dowolne miejsce na mapie podświetla na żółto działkę pod tym punktem i pokazuje jej numer ewidencyjny w dymku — przez usługę ULDK (Usługa Lokalizacji Działek Katastralnych), też prowadzoną przez GUGiK.

**Sieci uzbrojenia terenu (GESUT)** — osobne przełączniki (checkboxy) pod mapą dla sieci wodociągowej, kanalizacyjnej, elektroenergetycznej, gazowej, ciepłowniczej, telekomunikacyjnej, specjalnej, niezidentyfikowanej i urządzeń, z krajowej usługi integracyjnej KIUT prowadzonej przez GUGiK. Zaznaczone sieci są pobierane jednym zapytaniem (WMS pozwala podać kilka warstw naraz), więc włączenie wszystkich naraz nie zalewa przeglądarki równoległymi żądaniami i nie zakłóca wczytywania mapy bazowej. Te warstwy są widoczne dopiero przy bardzo dużym przybliżeniu (blisko adresu, nie widoku miasta) i mogą nie obejmować wszystkich powiatów — dane pochodzą od 385 różnych podmiotów prowadzących rejestr.

**Street View** — pomarańczowy przycisk z ikoną ludzika (jak Google „pegman”), żeby był od razu widoczny; zwykły odnośnik do panoramy Google Maps w danym punkcie, bez klucza API.

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

`node --test tests/*.test.mjs` sprawdza importer, usuwanie importu (kasuje tylko swoje zlecenia i nieużywane już lokalizacje), daty, duplikaty, ranking kandydatów wg dojazdu, podsumowanie trasy dnia (w tym nocleg jako inny punkt startu), optymalizację kolejności (dokładny algorytm zgadza się z przeglądem zupełnym, honoruje nietypowy punkt startu, nigdy nie zmyśla trasy tam, gdzie jej brak), że moduł auto-rozkładu został całkowicie usunięty, reset dnia z potwierdzeniem, pięć podkładów mapy bazowej nad mapą (nie jako kontrolka Leaflet), przycisk optymalizacji jako zawsze widoczny element górnego paska, adresy URL (Google Maps/wyszukiwanie/Street View/Booking.com), kopie danych oraz że tylko darmowy OSRM liczy trasy (bez Google Distance Matrix czy zaszytego klucza). Dochodzi do tego parsowanie geometrii działki (WKT z ULDK, z dziurami i wieloczęściowe) na GeoJSON, podpięcie przełącznika działek i identyfikacji po kliknięciu, ostrzeżenie o punktach bliższych niż 10 minut jazdy w obu listach, siedem odrębnych kolorów dnia użytych na mapie i na kafelkach, oraz że siedem kafelków dni mieści się na szerokości telefonu bez przewijania. Opcjonalny test rzeczywistego Excela korzysta ze zmiennej `T38_EXCEL`; plik źródłowy nie jest częścią repozytorium. Żadne testy nie składają zleceń, nie wysyłają wiadomości ani nie wołają zewnętrznych usług na żywo.

## Biblioteki i dane

Leaflet 1.9.4 (BSD-2-Clause), SheetJS CE 0.20.3 (Apache-2.0). Kopie bibliotek są dołączone lokalnie, aby podstawowy interfejs i odczyt Excela działały po utracie połączenia. Szczegóły źródeł w DATA_SOURCES.md, licencje w dist/vendor/.
