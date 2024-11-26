import { describe, it, expect, vi } from "vitest";
import { PokemonService } from "~/services/PokemonService";
import { PokeApiClient } from "~/services/PokeApiClient";
import { Pokemon } from "~/services/pokemon";

// Create a mock of the PokeApiClient
vi.mock("~/services/PokeApiClient");

// Dummy data for testing
const mockPokemonList: Pokemon[] = [
  { id: "1", name: "Bulbasaur" },
  { id: "2", name: "Ivysaur" },
  { id: "3", name: "Venusaur" },
];

describe("PokemonService", () => {
  let pokemonService: PokemonService;
  let mockPokeApiClient: PokeApiClient;

  beforeEach(() => {
    // Mock the getPokemonList method of PokeApiClient
    mockPokeApiClient = new PokeApiClient();
    mockPokeApiClient.getPokemonList = vi
      .fn()
      .mockResolvedValue(mockPokemonList);

    // Instantiate PokemonService with the mocked PokeApiClient
    pokemonService = new PokemonService(mockPokeApiClient);
  });

  it("should get the list of Pokémon", async () => {
    const pokemonList = await pokemonService.getPokemonList();
    expect(pokemonList).toEqual(mockPokemonList);
    expect(mockPokeApiClient.getPokemonList).toHaveBeenCalled();
  });

  it("should return the user's team", () => {
    const userId = "user123";
    const team = [{ id: "1", name: "Bulbasaur" }];
    pokemonService.togglePokemonInTeam(userId, team[0]); // Add Pokémon to team

    const userTeam = pokemonService.getUserTeam(userId);
    expect(userTeam).toEqual(team);
  });

  it("should clear the user's team", () => {
    const userId = "user123";
    pokemonService.togglePokemonInTeam(userId, { id: "1", name: "Bulbasaur" });

    pokemonService.clearTeam(userId);
    const userTeam = pokemonService.getUserTeam(userId);
    expect(userTeam).toEqual([]); // Team should be empty after clearing
  });

  it("should add Pokémon to the team if space is available", () => {
    const userId = "user123";
    const pokemon = { id: "1", name: "Bulbasaur" };

    const added = pokemonService.togglePokemonInTeam(userId, pokemon);
    expect(added).toBe(true); // Should be added
    const userTeam = pokemonService.getUserTeam(userId);
    expect(userTeam).toContain(pokemon);
  });

  it("should remove Pokémon from the team if already in the team", () => {
    const userId = "user123";
    const pokemon = { id: "1", name: "Bulbasaur" };
    pokemonService.togglePokemonInTeam(userId, pokemon); // Add Pokémon
    const removed = pokemonService.togglePokemonInTeam(userId, pokemon); // Remove Pokémon

    expect(removed).toBe(true); // Should be removed
    const userTeam = pokemonService.getUserTeam(userId);
    expect(userTeam).not.toContain(pokemon);
  });

  it("should not add Pokémon to the team if team is full (6 Pokémon)", () => {
    const userId = "user123";
    const fullTeam = [
      { id: "1", name: "Bulbasaur" },
      { id: "2", name: "Ivysaur" },
      { id: "3", name: "Venusaur" },
      { id: "4", name: "Charmander" },
      { id: "5", name: "Charmeleon" },
      { id: "6", name: "Charizard" },
    ];
    fullTeam.forEach((pokemon) =>
      pokemonService.togglePokemonInTeam(userId, pokemon),
    );

    const newPokemon = { id: "7", name: "Squirtle" };
    const added = pokemonService.togglePokemonInTeam(userId, newPokemon);
    expect(added).toBe(false); // Should not be added since the team is full
  });
});
