# Źródła i założenia

Sprawdzono 2026-09-13. Repozytorium nie zawiera danych zleceń użytkownika ani ich kopii.

| Źródło | Zakres | Adres |
|---|---|---|
| InPost Points | Kod, adres i współrzędne punktu; próba pojedynczego kodu | https://api-shipx-pl.easypack24.net/v1/points/{kod} |
| Nominatim / OpenStreetMap | Kandydaci adresu, wyłącznie Polska | https://nominatim.openstreetmap.org/search |
| OSRM demo | Macierz sekund/metrów, przebieg i odcinki trasy driving | https://router.project-osrm.org |
| OpenStreetMap | Kafelki podkładu, dane ODbL | https://tile.openstreetmap.org/{z}/{x}/{y}.png |

Współrzędne w danych aplikacji są w EPSG:4326, nazwane `lat` i `lng`. Parametry OSRM mają kolejność `lng,lat`; Leaflet używa `lat,lng`. GeoJSON używa `lng,lat`. Koszty przejazdu są w sekundach i metrach, w aplikacji przeliczane na minuty. Daty tygodni nie są konwertowane przez UTC. Data pobrania oraz źródło są zapisywane przy lokalizacjach i wynikach tras.

Brak GPS nie jest zerem. Niejednoznaczne adresy wymagają zatwierdzenia. Dopasowanie punktu do drogi dalej niż 400 m zatrzymuje obliczenia i prosi o poprawienie pinezki. Nie ma modelu aktualnego ruchu drogowego ani ograniczeń ciężarówek.

Dokumentacja i zasady:
- https://dokumentacja-inpost.atlassian.net/wiki/spaces/PL/pages/18153493
- https://operations.osmfoundation.org/policies/nominatim/
- https://operations.osmfoundation.org/policies/tiles/
- https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/maps/documentation/routes/usage-and-billing
- https://support.apple.com/pl-pl/guide/iphone/iphea86e5236/ios
