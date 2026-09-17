using NUnitLite;

internal static class Program
{
    private static int Main(string[] args) => new AutoRun(typeof(Program).Assembly).Execute(args);
}
