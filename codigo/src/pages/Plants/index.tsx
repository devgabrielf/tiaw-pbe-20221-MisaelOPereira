import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api, Plant } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { getImage } from "../../utils/getImage";

import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { AiOutlineStar, AiFillStar, AiOutlineLoading3Quarters } from "react-icons/ai";

import { Sidebar } from "../../components/Sidebar";

import './styles.css';

interface PlantsParams {
  plantName: string;
}

export function Plants() {
  const location = useLocation();
  const navigate = useNavigate();

  // @ts-ignore
  const prevPage = location.state?.prevPath as string || '/';

  console.log(prevPage);

  const { user, addFavoritePlant, removeFavoritePlant } = useAuth();

  const { plantName } = useParams<{plantName?: string}>() as PlantsParams;

  const [plants, setPlants] = useState<Plant[]>([]);
  const [plant, setPlant] = useState<Plant>();

  const [isFavorite, setIsFavorite] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(user && user.favorite_plants.includes(plantName));
  }, [user, plantName]);

  async function handleFavorite() {
    try {
      if (isFavorite) {
        await removeFavoritePlant(plantName);
  
        setIsFavorite(false);
      } else {
        await addFavoritePlant(plantName);
  
        setIsFavorite(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, {
          duration: 3000
        });
      }
    }
    
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const response = await api.get('/plants');
      const responsePlants = response.data as Plant[];
      responsePlants.shift();

      setPlants(responsePlants);

      const thisPlant = responsePlants.find(plant => plant.NomeComum === plantName);
      setPlant(thisPlant);

      setIsLoading(false);
    }

    (async () => await fetchData())();
  }, [plantName]);

  return (
    <div className="plant-page">
      <Sidebar plants={plants} />

      <div className="plant-container">
        <div className="plant-header">
          <button onClick={() => {navigate(prevPage)}}>
            <FiArrowLeft />
          </button>
          
          <h1>{plant?.NomeComum}</h1>

        </div>

        <button
          onClick={handleFavorite}
          type="button"
          title="Marcar/desmarcar como favorita"
        >
          {isFavorite ? (
            <AiFillStar />
          ) : (
            <AiOutlineStar />
          )}
        </button>

        {isLoading ? (
          <AiOutlineLoading3Quarters className="rotating" />
        ) : (
          plant && (
            <>
              <div className="plant">
                <div className="plant-info">
                  {plant.OutrosNomesComuns.length > 0 && (<p><strong>Outros nomes: </strong>{plant.OutrosNomesComuns.join(', ')}</p>)}
                  <p><strong>Nome científico: </strong>{plant.NomeCientífico}</p>
                  <p><strong>Regionalidade: </strong>{plant.Regionalidade.length < 5 ? plant.Regionalidade.join(', ') : 'Todo o Brasil'}</p>
                  <p><strong>Origem: </strong>{plant.Origem}</p>
                  <p><strong>Partes usadas: </strong>{plant.PartesUsadas.join(', ')}</p>
                  <p><strong>Uso principal: </strong>{plant.AçãoSobreOCorpo.UsoPrincipal}</p>
                  <p><strong>Demais usos: </strong>{plant.AçãoSobreOCorpo.UsosRelacionados.join(', ')}</p>
                </div>

                <img src={getImage(plant.NomeComum)} alt={plant.NomeComum} className="image" />
              </div>

              <p className="mb"><strong>Formas de uso: </strong></p>
              {plant.FormasDeUso.map(info => (
                <p key={info}>- {info}</p>
              ))}

              {plant.AçãoSobreOCorpo.ContraIndicações.length > 0 && (
                <>
                  <p className="mb"><strong>Contraindicações: </strong></p>
                  {plant.AçãoSobreOCorpo.ContraIndicações.map(info => (
                    <p key={info}>- {info}</p>
                  ))}
                </>
              )}

              <p className="references"><strong>Referências bibliográficas:</strong></p>
              <p>Grandi, Telma Sueli Mesquita. Tratado das plantas medicinais [recurso eletrônico]: minerais, nativas e cultivadas/Telma Sueli Mesquita Grandi. - 1.ed. - Dados eletrônicos. - Belo Horizonte: Adaequatio Estúdio, 2014. 1204 p. : il. color.</p>
              <p>Brasil. Agência Nacional de Vigilância Sanitária. Formulário de Fitoterápicos da Farmacopéia Brasileira / Agência Nacional de Vigilância Sanitária. Brasília: Anvisa, 2011. 126pg.</p>
            </>
          )
        )}

      </div>
    </div>
  );
}