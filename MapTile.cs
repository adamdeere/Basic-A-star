namespace aStarConsole
{
    public class MapTile
    {
        public int X { get; set; }
        public int Y { get; set; }

        public bool Walkable { get; set; }
        public bool IsStart { get; set; }
        public bool IsFinish { get; set; }
    }
}
