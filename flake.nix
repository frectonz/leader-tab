{
  description = "leader-tab flake";

  inputs = { nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable"; };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-darwin" ];

      forAllSystems = function:
        nixpkgs.lib.genAttrs systems (system:
          function (import nixpkgs {
            inherit system;
            overlays = [ ];
          }));
    in {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs
            pkgs.nodePackages.pnpm
            pkgs.nodePackages.typescript
            pkgs.nodePackages.typescript-language-server
          ];
        };
      });

      formatter = forAllSystems (pkgs: pkgs.nixfmt-classic);
    };
}
