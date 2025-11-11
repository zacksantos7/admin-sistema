import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Download, Search, Users } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function Carteirinhas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const carteirinhaRef = useRef<HTMLDivElement>(null);

  const { data: clientes, isLoading } = trpc.clientes.listWithDependentes.useQuery();

  const clientesAtivos = useMemo(() => {
    if (!clientes) return [];
    return clientes.filter((c) => c.status === "ativo");
  }, [clientes]);

  const filteredClientes = useMemo(() => {
    return clientesAtivos.filter((cliente) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        cliente.nome.toLowerCase().includes(searchLower) ||
        cliente.cpf.includes(searchLower)
      );
    });
  }, [clientesAtivos, searchTerm]);

  const handleGenerateCard = async (cliente: any, pessoa: any, tipo: "titular" | "dependente") => {
    const qrData = JSON.stringify({
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      numeroCartao: pessoa.numeroCartao || "Não disponível",
      plano: cliente.planoNome,
      operadora: "Prime Life",
      validade: pessoa.validade || "Não disponível",
      tipo,
    });

    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(url);
      setSelectedCliente({ ...pessoa, planoNome: cliente.planoNome, tipo });
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      toast.error("Erro ao gerar carteirinha");
    }
  };

  const handleDownload = async () => {
    if (carteirinhaRef.current) {
      try {
        const canvas = await html2canvas(carteirinhaRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = `carteirinha-${selectedCliente.nome.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("Carteirinha baixada com sucesso!");
      } catch (error) {
        console.error("Erro ao baixar carteirinha:", error);
        toast.error("Erro ao baixar carteirinha");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CreditCard className="w-8 h-8 animate-pulse mx-auto mb-2 text-pink-600" />
          <p className="text-gray-600">Carregando carteirinhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Carteirinhas Digitais</h1>
        <p className="text-gray-600 mt-2">Gere e baixe carteirinhas para clientes ativos</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes Ativos</CardTitle>
              <CardDescription>Selecione um cliente para gerar a carteirinha</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente ativo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClientes.map((cliente) => (
                <Card key={cliente.id} className="border-2 hover:border-pink-300 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{cliente.nome}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>CPF: <span className="font-mono">{cliente.cpf}</span></p>
                          <p>Plano: <Badge variant="outline">{cliente.planoNome}</Badge></p>
                          <p>Cartão: <span className="font-mono">{cliente.numeroCartao || "Não disponível"}</span></p>
                          <p>Validade: <span className="font-mono">{cliente.validade || "Não disponível"}</span></p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGenerateCard(cliente, cliente, "titular")}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gerar Carteirinha
                      </Button>
                    </div>

                    {cliente.dependentes && cliente.dependentes.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Dependentes</h4>
                        <div className="space-y-3">
                          {cliente.dependentes.map((dep: any) => (
                            <div key={dep.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{dep.nome}</p>
                                <p className="text-gray-600">CPF: <span className="font-mono">{dep.cpf}</span></p>
                                <p className="text-gray-600">Cartão: <span className="font-mono">{dep.numeroCartao || "Não disponível"}</span></p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleGenerateCard(cliente, dep, "dependente")}
                                className="bg-pink-600 hover:bg-pink-700"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Gerar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCliente} onOpenChange={() => setSelectedCliente(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carteirinha Digital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              ref={carteirinhaRef}
              className="bg-gradient-to-r from-pink-600 to-pink-800 text-white p-8 rounded-xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">PLANO DE SAÚDE</h2>
                  <p className="text-pink-100 text-sm mt-1">Prime Life</p>
                  {selectedCliente?.tipo === "dependente" && (
                    <Badge className="mt-2 bg-pink-200 text-pink-900 hover:bg-pink-200">
                      Dependente
                    </Badge>
                  )}
                </div>
                <div className="bg-white p-3 rounded-lg">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <p className="text-pink-100 text-xs uppercase tracking-wide">Nome</p>
                  <p className="font-semibold text-xl mt-1">{selectedCliente?.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-pink-100 text-xs uppercase tracking-wide">CPF</p>
                    <p className="font-mono mt-1">{selectedCliente?.cpf}</p>
                  </div>
                  <div>
                    <p className="text-pink-100 text-xs uppercase tracking-wide">Cartão</p>
                    <p className="font-mono mt-1">{selectedCliente?.numeroCartao || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-pink-100 text-xs uppercase tracking-wide">Plano</p>
                    <p className="font-semibold mt-1">{selectedCliente?.planoNome}</p>
                  </div>
                  <div>
                    <p className="text-pink-100 text-xs uppercase tracking-wide">Validade</p>
                    <p className="font-mono mt-1">{selectedCliente?.validade || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-pink-400 text-xs flex justify-between text-pink-100">
                <span>Emergência: 0800-000-0000</span>
                <span>Válido em todo território nacional</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedCliente(null)}>
                Fechar
              </Button>
              <Button onClick={handleDownload} className="bg-pink-600 hover:bg-pink-700">
                <Download className="w-4 h-4 mr-2" />
                Baixar Carteirinha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
