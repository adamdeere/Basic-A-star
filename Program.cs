//A* Search Pathfinding Example from : https://dotnetcoretutorials.com/2020/07/25/a-search-pathfinding-algorithm-in-c/
using aStarConsole;
using aStarConsole.HelperClass;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Diagnostics.Metrics;

internal class Program
{
    private static List<Tile> GetWalkableTiles(List<string> map, Tile currentTile, Tile targetTile)
    {
        var possibleTiles = new List<Tile>()
        {
                new Tile { X = currentTile.X, Y = currentTile.Y - 1, Parent = currentTile, Cost = currentTile.Cost + 1 },
                new Tile { X = currentTile.X, Y = currentTile.Y + 1, Parent = currentTile, Cost = currentTile.Cost + 1},
                new Tile { X = currentTile.X - 1, Y = currentTile.Y, Parent = currentTile, Cost = currentTile.Cost + 1 },
                new Tile { X = currentTile.X + 1, Y = currentTile.Y, Parent = currentTile, Cost = currentTile.Cost + 1 },
        };

        possibleTiles.ForEach(tile => tile.SetDistance(targetTile.X, targetTile.Y));

        var maxX = map.First().Length - 1;
        var maxY = map.Count - 1;

        return possibleTiles
                .Where(tile => tile.X >= 0 && tile.X <= maxX)
                .Where(tile => tile.Y >= 0 && tile.Y <= maxY)
                .Where(tile => map[tile.Y][tile.X] == ' ' || map[tile.Y][tile.X] == 'B')
                .ToList();
    }

    private static void Main(string[] args)
    {
        float totalMeters = 0;
        List<string> map = new()
            {
                "       |    B",
                " | | | | | | ",
                " | | |A|-| | ",
                " | | |-| | | ",
                "-| | | | | | ",
                " | | | | | | ",
                "             ",
            };

        var start = new Tile
        {
            Y = map.FindIndex(x => x.Contains('A'))
        };
        start.X = map[start.Y].IndexOf("A");

        var finish = new Tile
        {
            Y = map.FindIndex(x => x.Contains('B'))
        };
        finish.X = map[finish.Y].IndexOf("B");

        start.SetDistance(finish.X, finish.Y);

        var activeTiles = new List<Tile>
        {
            start
        };
        var visitedTiles = new List<Tile>();

        while (activeTiles.Any())
        {
            var checkTile = activeTiles.OrderBy(x => x.CostDistance).First();

            if (checkTile.X == finish.X && checkTile.Y == finish.Y)
            {
                //We found the destination and we can be sure (Because the the OrderBy above)
                //That it's the most low cost option.
                var tile = checkTile;
                Console.WriteLine("Retracing steps backwards...");
                while (true)
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
                        float miles = ConversionHelper.ConvertMetersToMiles(totalMeters);
                        Console.WriteLine($"{miles} and {totalMeters}");
                        return;
                    }
                }
            }

            visitedTiles.Add(checkTile);
            activeTiles.Remove(checkTile);

            var walkableTiles = GetWalkableTiles(map, checkTile, finish);

            foreach (var walkableTile in walkableTiles)
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

        Console.WriteLine("No Path Found!");
    }
}