# Źródła i założenia

Sprawdzono 2026-09-14. Repozytorium nie zawiera danych zleceń użytkownika ani ich kopii.

| Źródło | Zakres | Adres |
|---|---|---|
| InPost Points | Kod, adres i współrzędne punktu; próba pojedynczego kodu | https://api-shipx-pl.easypack24.net/v1/points/{kod} |
| Nominatim / OpenStreetMap | Kandydaci adresu, wyłącznie Polska | https://nominatim.openstreetmap.org/search |
| OSRM demo | Macierz sekund/metrów, przebieg i odcinki trasy driving | https://router.project-osrm.org |
| Overpass API (OpenStreetMap) | Składy kruszywa/kamienia w pobliżu punktu lub w obszarze trasy dnia | https://overpass-api.de/api/interpreter |
| OpenStreetMap | Kafelki podkładu, dane ODbL | https://tile.openstreetmap.org/{z}/{x}/{y}.png |
| GUGiK — ORTO (WMS) | Ortofotomapa standardowej rozdzielczości, warstwa `Raster` | https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution |
| GUGiK — KIUT (WMS) | Krajowa Integracja Uzbrojenia Terenu: sieci wodociągowa, kanalizacyjna, elektroenergetyczna, gazowa, ciepłownicza, telekomunikacyjna, specjalna, niezidentyfikowana, urządzenia | https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaUzbrojeniaTerenu |
| Esri World Imagery | Podkład satelitarny „Zobacz miejsce pracy” | https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer |
| Google (nieoficjalne kafelki) | Podkłady „Google” i „Google hybryda” — publiczny adres bez klucza API, poza Google Maps Platform | https://mt0-3.google.com/vt |
| Booking.com | Zwykły odnośnik wyszukiwania noclegu, bez konta/klucza | https://www.booking.com/searchresults.pl.html |

Współrzędne w danych aplikacji są w EPSG:4326, nazwane `lat` i `lng`. Parametry OSRM mają kolejność `lng,lat`; Leaflet używa `lat,lng`. GeoJSON używa `lng,lat`. Koszty przejazdu są w sekundach i metrach, w aplikacji przeliczane na minuty. Daty tygodni nie są konwertowane przez UTC. Data pobrania oraz źródło są zapisywane przy lokalizacjach i wynikach tras.

Brak GPS nie jest zerem. Niejednoznaczne adresy wymagają zatwierdzenia. Dopasowanie punktu do drogi dalej niż 400 m zatrzymuje obliczenia i prosi o poprawienie pinezki. Nie ma modelu aktualnego ruchu drogowego ani ograniczeń ciężarówek.

Overpass to współdzielony, darmowy serwer społeczności OSM — bywa przeciążony (odpowiedź 504); aplikacja wtedy pokazuje błąd i podpowiada spróbować później lub użyć odnośnika do Google Maps. Warstwy KIUT są widoczne dopiero przy bardzo dużym przybliżeniu (serwer sam ogranicza skalę, tak jak w oficjalnym module mapowym geoportal.gov.pl) i pochodzą ze scalenia 385 lokalnych rejestrów prowadzonych przez starostów — mogą nie obejmować każdego powiatu. Kilka zaznaczonych warstw KIUT jest pobieranych jednym zapytaniem WMS (LAYERS z przecinkami), nie osobno dla każdej. Street View to zwykły odnośnik `maps/@?api=1&map_action=pano&viewpoint=`, bez klucza API. Kafelki Google (`mtN.google.com/vt?lyrs=y|m`) to publiczny, nieudokumentowany adres bez klucza, którego używa wiele hobbystycznych narzędzi mapowych — poza formalnym wsparciem Google Maps Platform, może przestać działać bez zapowiedzi.

Dokumentacja i zasady:
- https://dokumentacja-inpost.atlassian.net/wiki/spaces/PL/pages/18153493
- https://operations.osmfoundation.org/policies/nominatim/
- https://operations.osmfoundation.org/policies/tiles/
- https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://www.geoportal.gov.pl/pl/dane/ortofotomapa
- https://www.geoportal.gov.pl/pl/dane/uzbrojenie-terenu
- https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaUzbrojeniaTerenu
- https://www.esri.com/en-us/legal/terms/full-master-agreement
- https://developers.google.com/maps/documentation/urls/get-started
- https://www.booking.com/content/terms.html
- https://support.apple.com/pl-pl/guide/iphone/iphea86e5236/ios
