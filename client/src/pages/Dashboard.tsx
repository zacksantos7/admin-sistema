import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Search, UserCheck, UserX, Users } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const utils = trpc.useUtils();

  const { data: clientes, isLoading } = trpc.clientes.listWithDependentes.useQuery();
  const syncMutation = trpc.clientes.syncFromSupabase.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.syncedCount} novos clientes sincronizados!`);
      utils.clientes.listWithDependentes.invalidate();
    },
    onError: () => {
      toast.error("Erro ao sincronizar dados do Supabase");
    },
  });

  const updateStatusMutation = trpc.clientes.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.clientes.listWithDependentes.invalidate();
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    
    return clientes.filter((cliente) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        cliente.nome.toLowerCase().includes(searchLower) ||
        cliente.cpf.includes(searchLower) ||
        cliente.planoNome.toLowerCase().includes(searchLower)
      );
    });
  }, [clientes, searchTerm]);

  const clientesAtivos = useMemo(() => {
    return filteredClientes.filter((c) => c.status === "ativo");
  }, [filteredClientes]);

  const clientesPendentes = useMemo(() => {
    return filteredClientes.filter((c) => c.status === "pendente");
  }, [filteredClientes]);

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleStatusChange = (id: number, newStatus: "ativo" | "pendente") => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-pink-600" />
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">Gerencie os clientes do Prime Life</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {syncMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Supabase
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredClientes.length}</div>
            <p className="text-xs text-gray-600 mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesAtivos.length}</div>
            <p className="text-xs text-gray-600 mt-1">Com pagamento aprovado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Pendentes</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{clientesPendentes.length}</div>
            <p className="text-xs text-gray-600 mt-1">Aguardando pagamento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Visualize e gerencie todos os clientes</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, CPF ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos ({filteredClientes.length})</TabsTrigger>
              <TabsTrigger value="ativos">Ativos ({clientesAtivos.length})</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes ({clientesPendentes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="todos">
              <ClientesTable
                clientes={filteredClientes}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatusMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="ativos">
              <ClientesTable
                clientes={clientesAtivos}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatusMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="pendentes">
              <ClientesTable
                clientes={clientesPendentes}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatusMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ClientesTableProps {
  clientes: any[];
  onStatusChange: (id: number, status: "ativo" | "pendente") => void;
  isUpdating: boolean;
}

function ClientesTable({ clientes, onStatusChange, isUpdating }: ClientesTableProps) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Dependentes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell className="font-mono text-sm">{cliente.cpf}</TableCell>
              <TableCell>
                <Badge variant="outline">{cliente.planoNome}</Badge>
                <span className="text-xs text-gray-600 ml-2">{cliente.planoPreco}</span>
              </TableCell>
              <TableCell>{cliente.telefone}</TableCell>
              <TableCell>
                {cliente.dependentes?.length > 0 ? (
                  <Badge variant="secondary">{cliente.dependentes.length}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                {cliente.status === "ativo" ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pendente</Badge>
                )}
              </TableCell>
              <TableCell>
                {cliente.status === "pendente" ? (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(cliente.id, "ativo")}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Ativar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(cliente.id, "pendente")}
                    disabled={isUpdating}
                  >
                    Desativar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
