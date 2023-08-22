namespace aStarConsole.HelperClass
{
    internal class ConversionHelper
    {
        public static float ConvertMetersToMiles(float meters)
        {
            return meters * 0.0006213712f;
        }

        public static float ConvertMilesToMeters(float miles)
        {
            return miles * 1609.344f;
        }
    }
}
