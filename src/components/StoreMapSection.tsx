import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Navigation, Phone, Heart, ShoppingBag } from 'lucide-react';
import { STORE_INFO } from '../types.ts';

const StoreLocationMarker: React.FC<{
  position: { lat: number; lng: number };
  onPositionResolved: (pos: { lat: number; lng: number }, formattedAddress?: string) => void;
}> = ({ position, onPositionResolved }) => {
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    let isMounted = true;
    async function lookupStorePlace() {
      if (!placesLib || !(placesLib as any).Place) return;
      try {
        const PlaceClass = (placesLib as any).Place;
        if (typeof PlaceClass.searchByText === 'function') {
          const result = await PlaceClass.searchByText({
            textQuery: 'Rua 4 de Janeiro, 780, Jardim Leblon, Cuiabá - MT',
            fields: ['location', 'formattedAddress', 'displayName'],
            region: 'BR',
            language: 'pt-BR',
          });
          const firstPlace = result?.places?.[0];
          if (isMounted && firstPlace?.location) {
            const lat =
              typeof firstPlace.location.lat === 'function'
                ? firstPlace.location.lat()
                : firstPlace.location.lat;
            const lng =
              typeof firstPlace.location.lng === 'function'
                ? firstPlace.location.lng()
                : firstPlace.location.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
              onPositionResolved({ lat, lng }, firstPlace.formattedAddress);
            }
          }
        }
      } catch (err) {
        console.warn('Unable to load place details from Places API:', err);
      }
    }
    lookupStorePlace();
    return () => {
      isMounted = false;
    };
  }, [placesLib, onPositionResolved]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setInfoOpen(true)}
        title="Meu Doce — Doceria Artesanal"
      >
        <Pin
          background={'#C86D88'}
          borderColor={'#8C3D55'}
          glyphColor={'#FFFFFF'}
          scale={1.25}
        />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={280}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-[#23191C]">
            <p className="font-serif-editorial font-bold text-base text-[#23191C]">
              Meu Doce — Doceria Artesanal
            </p>
            <p className="text-xs text-[#6E5D63] mt-1">
              {STORE_INFO.address}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <a
                href={STORE_INFO.mapsShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#C86D88] hover:underline"
              >
                Abrir rota no Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const StoreMapSection: React.FC = () => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [storeCoords, setStoreCoords] = useState<{ lat: number; lng: number }>(
    STORE_INFO.defaultCoords
  );
  const [resolvedAddress, setResolvedAddress] = useState<string>(STORE_INFO.address);

  const handlePositionResolved = React.useCallback(
    (pos: { lat: number; lng: number }, formattedAddress?: string) => {
      setStoreCoords(pos);
      if (formattedAddress) {
        setResolvedAddress(formattedAddress);
      }
    },
    []
  );

  return (
    <section id="contato" className="py-20 bg-[#FFF9FB] border-t border-[#F3DCE2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold tracking-[0.2em] text-[#C86D88] mb-3">
            ONDE ESTAMOS & CONTATOS
          </p>
          <h2 className="text-3xl md:text-4xl font-serif-editorial text-[#23191C] text-balance">
            Localização da loja & canais de pedido
          </h2>
          <p className="mt-3 text-[#6E5D63] text-sm md:text-base">
            Visite nossa loja física no Jardim Leblon em Cuiabá ou faça seu pedido direto pelo WhatsApp, Instagram e iFood.
          </p>
        </div>

        {/* Window-styled Map Container inspired by user's PROTOTIPO_7fab3d1f.png + Reference Aesthetic */}
        <div className="bg-white rounded-2xl border border-[#F3DCE2] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#FCEEF2]/60 border-b border-[#F3DCE2]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C86D88]/15 flex items-center justify-center text-[#C86D88]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#23191C]">
                  Meu Doce Doceria — Loja Física
                </h3>
                <p className="text-xs text-[#6E5D63]">{resolvedAddress}</p>
              </div>
            </div>

            <a
              href={STORE_INFO.mapsShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors whitespace-nowrap shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              Abrir no Google Maps
            </a>
          </div>

          {/* Explicit CSS height container to prevent CF2 Map Height Collapse */}
          <div className="w-full h-[400px] relative bg-[#FAF3F5]">
            {apiKey ? (
              <APIProvider apiKey={apiKey} region="BR" language="pt-BR">
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultZoom={16}
                  center={storeCoords}
                  gestureHandling="cooperative"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full"
                >
                  <StoreLocationMarker
                    position={storeCoords}
                    onPositionResolved={handlePositionResolved}
                  />
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-10 h-10 text-[#C86D88] mb-3" />
                <p className="text-base font-semibold text-[#23191C]">
                  {STORE_INFO.address}
                </p>
                <p className="text-xs text-[#6E5D63] mt-1 max-w-md">
                  Não foi possível carregar o mapa interativo no momento. Verifique sua conexão ou cota da API, ou abra a localização oficial diretamente abaixo.
                </p>
                <a
                  href={STORE_INFO.mapsShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors"
                >
                  Ver Localização no Google Maps
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Direct Contact Channels (WhatsApp, Instagram, iFood) matching Prototype & Documentation */}
        <div className="mt-10">
          <p className="text-center text-xs font-semibold tracking-widest text-[#6E5D63] mb-5">
            CANAIS OFICIAIS DE ATENDIMENTO E DELIVERY
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
                'Olá! Vim pelo site da Meu Doce Doceria Artesanal e gostaria de fazer um pedido.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-[#F3DCE2] hover:border-[#C86D88] transition-all hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/12 text-[#1DA851] flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-[#6E5D63] block">WhatsApp Direto</span>
                  <span className="text-base font-bold text-[#23191C] font-mono-tabular">
                    {STORE_INFO.whatsappDisplay}
                  </span>
                  <span className="text-xs text-[#C86D88] block mt-0.5">
                    Encomendas e pronta entrega
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6E5D63] group-hover:text-[#C86D88] transition-colors shrink-0" />
            </a>

            {/* Instagram */}
            <a
              href={STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-[#F3DCE2] hover:border-[#C86D88] transition-all hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E1306C]/12 text-[#E1306C] flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-[#6E5D63] block">Siga no Instagram</span>
                  <span className="text-sm font-bold text-[#23191C] truncate block max-w-[180px]">
                    {STORE_INFO.instagramHandle}
                  </span>
                  <span className="text-xs text-[#C86D88] block mt-0.5">
                    Novidades e bolos personalizados
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6E5D63] group-hover:text-[#C86D88] transition-colors shrink-0" />
            </a>

            {/* iFood */}
            <a
              href={STORE_INFO.ifoodUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-[#F3DCE2] hover:border-[#C86D88] transition-all hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EA1D2C]/12 text-[#EA1D2C] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-[#6E5D63] block">Delivery Oficial</span>
                  <span className="text-base font-bold text-[#23191C]">
                    Pedir pelo iFood
                  </span>
                  <span className="text-xs text-[#C86D88] block mt-0.5">
                    Entrega rápida em Cuiabá - MT
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6E5D63] group-hover:text-[#C86D88] transition-colors shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
