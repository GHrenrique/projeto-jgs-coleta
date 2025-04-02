$(document).ready(function() {
    // Função para mostrar feedback no modal
    function showFeedback(message, title = 'Feedback', callback = null) {
        $('#feedbackModalLabel').text(title);
        $('#feedbackMessage').text(message);
        
        // Define o ícone baseado no título
        let iconClass = 'fas fa-info-circle';
        if (title === 'Sucesso') {
            iconClass = 'fas fa-check-circle text-success';
        } else if (title === 'Erro') {
            iconClass = 'fas fa-exclamation-circle text-danger';
        } else if (title === 'Atenção') {
            iconClass = 'fas fa-exclamation-triangle text-warning';
        }
        
        $('#feedbackModal .modal-body i').removeClass().addClass(iconClass + ' fa-3x');
        
        const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
        
        // Remove event listener anterior se existir
        $('#feedbackModal').off('hidden.bs.modal');
        
        // Adiciona novo event listener se houver callback
        if (callback) {
            $('#feedbackModal').on('hidden.bs.modal', callback);
        }
        
        modal.show();
    }

    // Função para mostrar confirmação
    function showConfirm(message, onConfirm) {
        $('#confirmMessage').text(message);
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        
        // Remove event listener anterior se existir
        $('#confirmButton').off('click');
        
        // Adiciona novo event listener
        $('#confirmButton').on('click', function() {
            modal.hide();
            onConfirm();
        });
        
        modal.show();
    }

    // Função para carregar a lista de clientes
    function loadClientes() {
        $.ajax({
            url: 'http://localhost:3000/clientes',
            type: 'GET',
            success: function(clientes) {
                const tbody = $('#clientesList');
                tbody.empty();
                
                clientes.forEach(function(cliente) {
                    const row = `
                        <tr>
                            <td>${cliente.id}</td>
                            <td>${cliente.nome}</td>
                            <td>
                                <div class="btn-group" role="group">
                                    <button class="btn btn-sm btn-primary btn-editar" data-id="${cliente.id}" data-nome="${cliente.nome}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger btn-excluir" data-id="${cliente.id}" data-nome="${cliente.nome}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            },
            error: function(xhr, status, error) {
                showFeedback('Erro ao carregar clientes: ' + error, 'Erro');
            }
        });
    }

    // Initialize Select2 for better dropdown experience
    if ($('#cliente').length) {
        $('#cliente').select2({
            placeholder: 'Selecione um cliente',
            width: '100%'
        });
    }

    // Load clients and set next protocol number
    if ($('#cliente').length) {
        $.ajax({
            url: 'http://localhost:3000/clientes',
            type: 'GET',
            success: function(clientes) {
                const clienteSelect = $('#cliente');
                clientes.forEach(function(cliente) {
                    clienteSelect.append(new Option(cliente.nome, cliente.id));
                });
            },
            error: function(xhr, status, error) {
                showFeedback('Erro ao carregar clientes: ' + error, 'Erro');
            }
        });
    }

    // Get next protocol number
    if ($('#numeroProtocolo').length) {
        $.ajax({
            url: 'http://localhost:3000/config',
            type: 'GET',
            success: function(config) {
                const nextProtocol = config.ultimoProtocolo + 1;
                $('#numeroProtocolo').val(nextProtocol);
            },
            error: function(xhr, status, error) {
                showFeedback('Erro ao carregar número do protocolo: ' + error, 'Erro');
            }
        });
    }

    // Form submission
    if ($('#protocoloForm').length) {
        $('#protocoloForm').on('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                numeroProtocolo: $('#numeroProtocolo').val(),
                data: $('#data').val(),
                notasFiscais: $('#notasFiscais').val(),
                clienteId: $('#cliente').val(),
                nomeCompleto: $('#nomeCompleto').val(),
                rg: $('#rg').val(),
                placa: $('#placa').val(),
                notaFiscal: $('#notaFiscal').is(':checked'),
                certificadoAnalise: $('#certificadoAnalise').is(':checked'),
                loteAmostra: $('#loteAmostra').is(':checked'),
                boletoAnexo: $('#boletoAnexo').is(':checked')
            };

            showConfirm('Tem certeza que deseja salvar este protocolo?', function() {
                // Update protocol number in config
                $.ajax({
                    url: 'http://localhost:3000/config',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ultimoProtocolo: parseInt(formData.numeroProtocolo)
                    }),
                    success: function() {
                        // Save protocol after updating config
                        $.ajax({
                            url: 'http://localhost:3000/protocolos',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(formData),
                            success: function(response) {
                                showFeedback('Protocolo salvo com sucesso!', 'Sucesso', function() {
                                    window.location.href = 'lista.html';
                                });
                            },
                            error: function(xhr, status, error) {
                                showFeedback('Erro ao salvar o protocolo: ' + error, 'Erro');
                            }
                        });
                    },
                    error: function(xhr, status, error) {
                        showFeedback('Erro ao atualizar número do protocolo: ' + error, 'Erro');
                    }
                });
            });
        });
    }

    // Print functionality
    if ($('#btnImprimir').length) {
        $('#btnImprimir').on('click', function() {
            showConfirm('Deseja imprimir o protocolo?', function() {
                window.print();
            });
        });
    }

    // Format RG input
    if ($('#rg').length) {
        $('#rg').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            if (value.length > 9) value = value.substr(0, 9);
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
            $(this).val(value);
        });
    }

    // Format placa input
    if ($('#placa').length) {
        $('#placa').on('input', function() {
            let value = $(this).val().toUpperCase();
            value = value.replace(/[^A-Z0-9]/g, '');
            if (value.length > 7) value = value.substr(0, 7);
            if (value.length > 3) {
                value = value.substr(0, 3) + '-' + value.substr(3);
            }
            $(this).val(value);
        });
    }

    // Auto-fill nome when selecting client
    if ($('#cliente').length) {
        $('#cliente').on('change', function() {
            const clienteId = $(this).val();
            if (clienteId) {
                $.ajax({
                    url: `http://localhost:3000/clientes/${clienteId}`,
                    type: 'GET',
                    success: function(cliente) {
                        $('#nomeCompleto').val(cliente.nome);
                    },
                    error: function(xhr, status, error) {
                        showFeedback('Erro ao carregar dados do cliente: ' + error, 'Erro');
                    }
                });
            }
        });
    }

    // Cliente form submission
    if ($('#formCliente').length) {
        $('#formCliente').on('submit', function(e) {
            e.preventDefault();
            
            const nome = $('#nome').val().trim();
            
            if (!nome) {
                showFeedback('Por favor, preencha o nome do cliente.', 'Atenção');
                return;
            }
            
            showConfirm('Tem certeza que deseja cadastrar este cliente?', function() {
                // Get current clients to determine next ID
                $.ajax({
                    url: 'http://localhost:3000/clientes',
                    type: 'GET',
                    success: function(clientes) {
                        const nextId = clientes.length > 0 
                            ? Math.max(...clientes.map(c => c.id)) + 1 
                            : 1;

                        const novoCliente = {
                            id: nextId,
                            nome: nome
                        };

                        // Save new client
                        $.ajax({
                            url: 'http://localhost:3000/clientes',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(novoCliente),
                            success: function() {
                                showFeedback('Cliente cadastrado com sucesso!', 'Sucesso', function() {
                                    window.location.href = 'lista-clientes.html';
                                });
                                $('#nome').val(''); // Clear form
                            },
                            error: function(xhr, status, error) {
                                showFeedback('Erro ao cadastrar cliente: ' + error, 'Erro');
                            }
                        });
                    },
                    error: function(xhr, status, error) {
                        showFeedback('Erro ao carregar lista de clientes: ' + error, 'Erro');
                    }
                });
            });
        });
    }

    // Lista de Clientes - Carregar lista
    if ($('#clientesList').length) {
        loadClientes();
    }

    // Lista de Clientes - Excluir cliente
    $(document).on('click', '.btn-excluir', function() {
        const id = $(this).data('id');
        const nome = $(this).data('nome');
        
        showConfirm(`Tem certeza que deseja excluir o cliente "${nome}"?`, function() {
            $.ajax({
                url: `http://localhost:3000/clientes/${id}`,
                type: 'DELETE',
                success: function() {
                    showFeedback('Cliente excluído com sucesso!', 'Sucesso', function() {
                        loadClientes();
                    });
                },
                error: function(xhr, status, error) {
                    showFeedback('Erro ao excluir cliente: ' + error, 'Erro');
                }
            });
        });
    });

    // Lista de Clientes - Editar cliente
    $(document).on('click', '.btn-editar', function() {
        const id = $(this).data('id');
        const nome = $(this).data('nome');
        
        $('#editId').val(id);
        $('#editNome').val(nome);
        
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    });

    // Lista de Clientes - Salvar edição
    $('#saveEditButton').on('click', function() {
        const id = $('#editId').val();
        const nome = $('#editNome').val().trim();
        
        if (!nome) {
            showFeedback('Por favor, preencha o nome do cliente.', 'Atenção');
            return;
        }
        
        showConfirm(`Tem certeza que deseja atualizar o cliente "${nome}"?`, function() {
            $.ajax({
                url: `http://localhost:3000/clientes/${id}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ nome: nome }),
                success: function() {
                    showFeedback('Cliente atualizado com sucesso!', 'Sucesso', function() {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                        modal.hide();
                        loadClientes();
                    });
                },
                error: function(xhr, status, error) {
                    showFeedback('Erro ao atualizar cliente: ' + error, 'Erro');
                }
            });
        });
    });
}); 