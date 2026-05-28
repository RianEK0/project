import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/empty_state_widget.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<UserProvider>().loadUsers();
    });
  }

  Future<void> _delete(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus user?'),
        content: const Text('User yang dihapus tidak bisa login lagi.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    try {
      await context.read<UserProvider>().deleteUser(id);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Exception: ', '')),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final users = context.watch<UserProvider>().users;

    return Scaffold(
      appBar: AppBar(title: const Text('Manajemen User')),
      body: users.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.group_outlined,
              title: 'Belum ada user',
              message: 'User akan muncul setelah admin pertama dibuat',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final user = users[index];
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: user.isActive
                          ? AppColors.softOrange
                          : Colors.grey.shade200,
                      child: Icon(
                        Icons.person,
                        color: user.isActive ? AppColors.brown : Colors.grey,
                      ),
                    ),
                    title: Text(
                      user.name,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      '${user.username} • ${user.role} • ${user.isActive ? 'Aktif' : 'Nonaktif'}\nDibuat ${DateFormatter.formatDate(user.createdAt)}',
                    ),
                    isThreeLine: true,
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) async {
                        if (value == 'edit') {
                          Navigator.pushNamed(
                            context,
                            '/user-form',
                            arguments: user.id,
                          );
                        }
                        if (value == 'toggle') {
                          try {
                            await context.read<UserProvider>().toggleActive(
                              user,
                            );
                          } catch (error) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  error.toString().replaceFirst(
                                    'Exception: ',
                                    '',
                                  ),
                                ),
                              ),
                            );
                          }
                        }
                        if (value == 'delete') _delete(user.id);
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(value: 'edit', child: Text('Edit')),
                        if (!user.isFirstAdmin)
                          PopupMenuItem(
                            value: 'toggle',
                            child: Text(
                              user.isActive ? 'Nonaktifkan' : 'Aktifkan',
                            ),
                          ),
                        if (!user.isFirstAdmin)
                          const PopupMenuItem(
                            value: 'delete',
                            child: Text('Hapus'),
                          ),
                      ],
                    ),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemCount: users.length,
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/user-form'),
        icon: const Icon(Icons.person_add_alt),
        label: const Text('Tambah User'),
      ),
    );
  }
}
