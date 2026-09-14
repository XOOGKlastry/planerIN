# Źródła i założenia

Sprawdzono 2026-09-14. Repozytorium nie zawiera danych zleceń użytkownika ani ich kopii.

| Źródło | Zakres | Adres |
|---|---|---|
| InPost Points | Kod, adres i współrzędne punktu; próba pojedynczego kodu | https://api-shipx-pl.easypack24.net/v1/points/{kod} |
| Nominatim / OpenStreetMap | Kandydaci adresu, wyłącznie Polska | https://nominatim.openstreetmap.org/search |
| OSRM demo | Macierz sekund/metrów, przebieg i odcinki trasy driving (domyślne, darmowe) | https://router.project-osrm.org |
| Google Distance Matrix + Maps JavaScript API | Macierz sekund/metrów — tylko jeśli użytkownik wpisze własny, płatny klucz w Ustawieniach | https://maps.googleapis.com/maps/api/js |
| Overpass API (OpenStreetMap) | Składy kruszywa/kamienia w pobliżu punktu lub w obszarze trasy dnia | https://overpass-api.de/api/interpreter |
| OpenStreetMap | Kafelki podkładu, dane ODbL | https://tile.openstreetmap.org/{z}/{x}/{y}.png |
| Booking.com | Zwykły odnośnik wyszukiwania noclegu, bez konta/klucza | https://www.booking.com/searchresults.pl.html |

Współrzędne w danych aplikacji są w EPSG:4326, nazwane `lat` i `lng`. Parametry OSRM mają kolejność `lng,lat`; Leaflet używa `lat,lng`. GeoJSON używa `lng,lat`. Koszty przejazdu są w sekundach i metrach, w aplikacji przeliczane na minuty. Daty tygodni nie są konwertowane przez UTC. Data pobrania oraz źródło są zapisywane przy lokalizacjach i wynikach tras.

Brak GPS nie jest zerem. Niejednoznaczne adresy wymagają zatwierdzenia. Dopasowanie punktu do drogi dalej niż 400 m zatrzymuje obliczenia i prosi o poprawienie pinezki. Nie ma modelu aktualnego ruchu drogowego ani ograniczeń ciężarówek.

Klucz Google Maps API (jeśli wpisany) zostaje wyłącznie w ustawieniach na danym urządzeniu (IndexedDB) — nie jest w repozytorium i jest celowo wycinany z kopii planu przy „Przekaż plan”, żeby nie trafił na telefon kolegi razem z Twoim rachunkiem. Overpass to współdzielony, darmowy serwer społeczności OSM — bywa przeciążony (odpowiedź 504); aplikacja wtedy pokazuje błąd i podpowiada spróbować później lub użyć odnośnika do Google Maps.

Dokumentacja i zasady:
- https://dokumentacja-inpost.atlassian.net/wiki/spaces/PL/pages/18153493
- https://operations.osmfoundation.org/policies/nominatim/
- https://operations.osmfoundation.org/policies/tiles/
- https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/maps/documentation/distance-matrix/usage-and-billing
- https://developers.google.com/maps/documentation/javascript/get-api-key
- https://cloud.google.com/billing/docs/how-to/budgets
- https://www.booking.com/content/terms.html
- https://support.apple.com/pl-pl/guide/iphone/iphea86e5236/ios
