//A* Search Pathfinding Example from : https://dotnetcoretutorials.com/2020/07/25/a-search-pathfinding-algorithm-in-c/
using aStarConsole;
using aStarConsole.HelperClass;
using Newtonsoft.Json;

internal class Program
{
    private static List<Tile> GetWalkableTiles(List<string> map, Tile currentTile, Tile targetTile)
    {
        var surroundingTiles = new List<Tile>()
        {
                new Tile { X = currentTile.X, Y = currentTile.Y - 1, Parent = currentTile, Cost = currentTile.Cost + 1 },
                new Tile { X = currentTile.X, Y = currentTile.Y + 1, Parent = currentTile, Cost = currentTile.Cost + 1},
                new Tile { X = currentTile.X - 1, Y = currentTile.Y, Parent = currentTile, Cost = currentTile.Cost + 1 },
                new Tile { X = currentTile.X + 1, Y = currentTile.Y, Parent = currentTile, Cost = currentTile.Cost + 1 },
        };

        var maxX = 24;
        var maxY = map.Count - 1; // 11

        var possibleTiles = surroundingTiles
               .Where(tile => tile.X >= 0 && tile.X <= maxX)
               .Where(tile => tile.Y >= 0 && tile.Y <= maxY)
               .Where(tile => map[tile.Y][tile.X] == ' ' || map[tile.Y][tile.X] == 'B')
               .ToList();

        possibleTiles.ForEach(tile => tile.SetDistance(targetTile.X, targetTile.Y));


        return possibleTiles;
    }
    private static List<Tile> GetTile(List<Tile> map2, Tile currentTile)
    {
        var surroundingTiles = new List<Tile>()
        {
                new Tile { X = currentTile.X, Y = currentTile.Y - 1, Parent = currentTile, Cost = currentTile.Cost + 1 },
                new Tile { X = currentTile.X, Y = currentTile.Y + 1, Parent = currentTile, Cost = currentTile.Cost + 1},
                new Tile { X = currentTile.X - 1, Y = currentTile.Y, Parent = currentTile, Cost = currentTile.Cost + 1 },
                new Tile { X = currentTile.X + 1, Y = currentTile.Y, Parent = currentTile, Cost = currentTile.Cost + 1 },
        };

        foreach (var tile in surroundingTiles)
        {
            var mapTile = map2
                .Where(tiled => tiled.X == tile.X)
                .Where(tiled => tiled.Y == tile.Y)
                .FirstOrDefault();
            if (mapTile != null)
            {
                tile.Walkable = mapTile.Walkable;
                tile.IsFinish = mapTile.IsFinish;
                tile.IsStart = mapTile.IsStart; 
            }
           

        }
        return surroundingTiles;

    }
    private static List<Tile> PossibleTiles(List<Tile> map2, Tile currentTile, Tile targetTile)
    {

        var possibleTiles = GetTile(map2, currentTile);

        var lolTiles = possibleTiles
               .Where(tile => tile.Walkable || tile.IsFinish)
               .ToList();

        lolTiles.ForEach(tile => tile.SetDistance(targetTile.X, targetTile.Y));


        return lolTiles;
    }
    private static void Main(string[] args)
    {
        float totalMeters = 0;
        List<string> map = new();
        List<Tile> tileList = new();
        List<MapTile> mapTileList = new();
        using (StreamReader sr = new ("Maps/map.txt"))
        {
            while (sr.Peek() != -1)
            {
               map.Add(sr.ReadLine());
            }
        }
        for (int y = 0; y < map.Count; y++)
        {
            char[] chars = map[y].ToCharArray();

            for (int x = 0; x < chars.Length; x++)
            {
                bool walkable = false;
                bool starting = false;
                bool finishing = false;

                switch (chars[x])
                {
                    case ' ':
                        walkable = true;
                        break;

                    case 'A':
                        starting = true;
                        break;

                    case 'B':
                        finishing = true;
                        break;

                    default:
                        walkable = false;
                        break;
                }

                var tile = new Tile()
                {
                    X = x,
                    Y = y,
                    IsStart = starting,
                    IsFinish = finishing,
                    Walkable = walkable
                };
                var mapTile = new MapTile()
                {
                    X = x,
                    Y = y,
                    IsStart = starting,
                    IsFinish = finishing,
                    Walkable = walkable
                };
                mapTileList.Add(mapTile);
                tileList.Add(tile);
            }
        }
        string output = JsonConvert.SerializeObject(mapTileList);
        using (StreamWriter sw = new("Maps/mapJson.json"))
        {
            sw.WriteLine(output);
        }
        var startingTile  = tileList.Where(x => x.IsStart).First();
        var finishingTile = tileList.Where(x => x.IsFinish).First();
        
        startingTile.SetDistance(finishingTile.X, finishingTile.Y);

        var activeTiles = new List<Tile>
        {
            startingTile
        };
        var visitedTiles = new List<Tile>();
        Console.WriteLine("calculating route");
        bool startFound = false;
        while (activeTiles.Any())
        {
            var checkTile = activeTiles.OrderBy(x => x.CostDistance).First();

            if (checkTile.X == finishingTile.X && checkTile.Y == finishingTile.Y)
            {
                //We found the destination and we can be sure (Because the the OrderBy above)
                //That it's the most low cost option.
                var tile = checkTile;
                Console.WriteLine("Retracing steps backwards...");
             
                while (!startFound)
                {
                    if (map[tile.Y][tile.X] == ' ')
                    {
                        var newMapRow = map[tile.Y].ToCharArray();
                        newMapRow[tile.X] = '*';
                        totalMeters += 1.25f;
                        map[tile.Y] = new string(newMapRow);
                    }
                    tile = tile.Parent;
                    if (tile == null)
                    {
                        //Many people tend to walk at about 1.42 metres per second
                        Console.WriteLine("Map looks like :");
                        map.ForEach(Console.WriteLine);
                        Console.WriteLine("Done!");
                        Console.WriteLine($"Total meters to walk: {totalMeters}");
                        Console.WriteLine($"ETA to destination: {totalMeters / 1.42f} seconds");
                        startFound = true;
                    }
                }
            }

            visitedTiles.Add(checkTile);
            activeTiles.Remove(checkTile);

            var walkingTiles = PossibleTiles(tileList, checkTile, finishingTile);

            foreach (var walkableTile in walkingTiles)
            {
                //We have already visited this tile so we don't need to do so again!
                if (visitedTiles.Any(x => x.X == walkableTile.X && x.Y == walkableTile.Y))
                    continue;

                //It's already in the active list, but that's OK, maybe this new tile has a better value (e.g. We might zigzag earlier but this is now straighter).
                if (activeTiles.Any(x => x.X == walkableTile.X && x.Y == walkableTile.Y))
                {
                    var existingTile = activeTiles.First(x => x.X == walkableTile.X && x.Y == walkableTile.Y);
                    if (existingTile.CostDistance > checkTile.CostDistance)
                    {
                        activeTiles.Remove(existingTile);
                        activeTiles.Add(walkableTile);
                    }
                }
                else
                {
                    //We've never seen this tile before so add it to the list.
                    activeTiles.Add(walkableTile);
                }
            }
        }
        if (!startFound)
        {
            Console.WriteLine("No Path Found!");
        }
       
    }
}