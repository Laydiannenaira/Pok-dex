import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { Card, Pokemon, PokemonType } from '../../components/Card';
import { useNavigation } from '@react-navigation/native';

import pokeballHeader from '../../assets/img/pokeball.png'
import api from '../../service/api';

import * as S from './styles';
// import axios from 'axios';
import { Button } from '../../components/Button';

type Request = {
  id: number;
  types: PokemonType[]
}



export function Home() {

  const [pokemons, setPokemons] = useState<Pokemon[]>([])

  const [page, setPage] = useState(1) // adicionando o estado da página atual

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {navigate} = useNavigation()

  function handleNavigation(pokemonId: number) {
    navigate('About', {
      pokemonId,
    })
  }

  useEffect(() => {
    async function getAllPokemons() {

      setIsLoading(true);

      const response = await api.get(`pokemon?offset=${(page - 1) * 20}&limit=20`);
      // console.log(response.data)
      const { results } = response.data;

      // console.log(results);
      const payloadPokemons = await Promise.all(
        results.map(async (pokemon: Pokemon) => {
          const {id, types} = await getMoreInfo(pokemon.url);

          return {
            name: pokemon.name,
            id,
            types
          }
        })
      );
      console.log(payloadPokemons);
      // setPokemons(payloadPokemons)
      setIsLoading(false);
      setPokemons(prevPokemons => [...prevPokemons, ...payloadPokemons]) // adicionando novos pokemons ao array existente
      // setPage(prevPage => prevPage + 1) // atualizando a página atual depois de carregar os dados
      // console.log(payloadPokemons)
    }
    getAllPokemons(); 
  }, [page])

  async function getMoreInfo(url: string): Promise<Request> {
    const response = await api.get(url)
    const {id, types} = response.data;

    return {
      id, types
    }
  }
  
  function handleLoadMore() {
    setPage(page => page + 1);
  }



  return <S.Container>
    {/* {pokemons.map((pokemon) => 
      <Card data={}/>
      
    )} */}

    <FlatList
      ListHeaderComponent={
        <>
          <S.Header source={pokeballHeader} />
          <S.Title>Pokédex</S.Title>
        </>
      }
      contentContainerStyle={{
        paddingHorizontal:20
      }}
      data={pokemons}
      // keyExtractor={pokemon => pokemon.id.toString()}
      // // keyExtractor={(item) => item.id.toString()}
      // renderItem={({item: pokemon}) => (
      //   <Card key={pokemon.id} data={pokemon} onPress={() => {
      //     handleNavigation(pokemon.id)
      //   }}/>
      //   )}

      //O CÓDIGO ABAIXO É UMA TENTATIVA DE CORRIGIR A KEY

      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <Card key={index} data={item} onPress={() => {
          handleNavigation(item.id)
        }}/>
      )}


        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Load More" style={{marginTop: 10 ,marginBottom: 15}} onPress={handleLoadMore} />
          )
        }
    />

    {/* <Button title="Next Page" onPress={
      handleLoadMore} 
    /> */}


  </S.Container>
}